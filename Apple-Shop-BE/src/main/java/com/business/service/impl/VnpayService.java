package com.business.service.impl;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.dto.OrderDTO;
import com.business.dto.VnpayCreatePaymentRequestDTO;
import com.business.dto.VnpayCreatePaymentResponseDTO;
import com.business.dto.VnpayReturnVerifyResponseDTO;
import com.business.entity.OrderEntity;
import com.business.repository.OrderRepository;
import com.business.service.ICartService;

@Service
public class VnpayService {

    private static final String VNPAY_VERSION = "2.1.0";
    private static final String VNPAY_COMMAND = "pay";
    private static final String VNPAY_CURRENCY = "VND";
    private static final String VNPAY_LOCALE = "vn";

    @Value("${vnpay.tmn-code:5HVNFMY7}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret:JU332J1YDC7NFV6YBNIDOB01P2FB6FEC}")
    private String vnpHashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url:http://localhost:3000/payment-result}")
    private String vnpReturnUrl;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ICartService cartService;

    @Transactional
    public VnpayCreatePaymentResponseDTO createPaymentUrl(VnpayCreatePaymentRequestDTO request, String clientIp) {
        if (request == null || request.getOrder() == null) {
            throw new RuntimeException("Thiếu dữ liệu thanh toán VNPay");
        }

        OrderDTO orderDTO = request.getOrder();
        orderDTO.setPaymentMethod("VNPAY_QR");
        OrderDTO savedOrder = orderService.save(orderDTO);

        String returnUrl = vnpReturnUrl;
        if (returnUrl == null || returnUrl.trim().isEmpty()) {
            throw new RuntimeException("Thiếu cấu hình returnUrl cho VNPay");
        }

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", VNPAY_VERSION);
        params.put("vnp_Command", VNPAY_COMMAND);
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", toVnpAmount(savedOrder.getTotalPrice()));
        params.put("vnp_CurrCode", VNPAY_CURRENCY);
        params.put("vnp_TxnRef", String.valueOf(savedOrder.getId()));
        params.put("vnp_OrderInfo", "Thanh toan don hang:" + safeText(savedOrder.getSku()));
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", VNPAY_LOCALE);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", clientIp == null || clientIp.trim().isEmpty() ? "127.0.0.1" : clientIp);
        params.put("vnp_CreateDate", formatTime(new Date()));
        params.put("vnp_ExpireDate", formatTime(new Date(System.currentTimeMillis() + 15 * 60 * 1000L)));

        String paymentUrl = buildPaymentUrl(params);
        return new VnpayCreatePaymentResponseDTO(paymentUrl, savedOrder.getId(), savedOrder.getSku());
    }

    @Transactional
    public VnpayReturnVerifyResponseDTO verifyReturn(Map<String, String> inputParams) {
        VnpayReturnVerifyResponseDTO response = new VnpayReturnVerifyResponseDTO();
        response.setValidSignature(false);
        response.setSuccess(false);
        response.setMessage("Invalid signature");

        if (inputParams == null || inputParams.isEmpty()) {
            response.setMessage("Invalid request");
            return response;
        }

        String secureHash = inputParams.get("vnp_SecureHash");
        String computedHash = hmacSHA512(vnpHashSecret, buildVerifyHashData(inputParams));
        if (secureHash == null || !secureHash.equalsIgnoreCase(computedHash)) {
            return response;
        }

        response.setValidSignature(true);
        response.setResponseCode(inputParams.get("vnp_ResponseCode"));
        response.setTransactionStatus(inputParams.get("vnp_TransactionStatus"));

        String txnRef = inputParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.trim().isEmpty()) {
            response.setMessage("Order not found");
            return response;
        }

        Long orderId;
        try {
            orderId = Long.valueOf(txnRef);
        } catch (NumberFormatException ex) {
            response.setMessage("Order not found");
            return response;
        }

        response.setOrderId(orderId);

        OrderEntity order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            response.setMessage("Order not found");
            return response;
        }

        String amountText = inputParams.get("vnp_Amount");
        String expectedAmount = toVnpAmount(order.getTotalPrice());
        if (amountText == null || !expectedAmount.equals(amountText)) {
            response.setMessage("Invalid amount");
            return response;
        }

        try {
            OrderDTO orderDTO = orderService.getOrderById(orderId);
            response.setOrder(orderDTO);
        } catch (Exception ex) {
            // Ignore error if cannot map
        }

        boolean success = "00".equals(inputParams.get("vnp_ResponseCode"))
                && "00".equals(inputParams.get("vnp_TransactionStatus"));
        if (success) {
            orderService.markOrderPaid(orderId);
            if (order.getUser() != null && order.getUser().getId() != null) {
                cartService.deleteByUserId(order.getUser().getId());
            }
            response.setSuccess(true);
            response.setMessage("Payment success");
            return response;
        }

        response.setMessage("Payment failed");
        return response;
    }

    @Transactional
    public Map<String, String> processIpn(Map<String, String> inputParams) {
        Map<String, String> response = new HashMap<>();
        response.put("RspCode", "97");
        response.put("Message", "Invalid signature");

        if (inputParams == null || inputParams.isEmpty()) {
            response.put("RspCode", "99");
            response.put("Message", "Invalid request");
            return response;
        }

        String secureHash = inputParams.get("vnp_SecureHash");
        String computedHash = hmacSHA512(vnpHashSecret, buildVerifyHashData(inputParams));
        if (secureHash == null || !secureHash.equalsIgnoreCase(computedHash)) {
            return response;
        }

        String txnRef = inputParams.get("vnp_TxnRef");
        String amountText = inputParams.get("vnp_Amount");
        String responseCode = inputParams.get("vnp_ResponseCode");
        String transactionStatus = inputParams.get("vnp_TransactionStatus");

        if (txnRef == null || txnRef.trim().isEmpty()) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
            return response;
        }

        Long orderId;
        try {
            orderId = Long.valueOf(txnRef);
        } catch (NumberFormatException ex) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
            return response;
        }

        OrderEntity order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
            return response;
        }

        String expectedAmount = toVnpAmount(order.getTotalPrice());
        if (amountText == null || !expectedAmount.equals(amountText)) {
            response.put("RspCode", "04");
            response.put("Message", "Invalid amount");
            return response;
        }

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            orderService.markOrderPaid(orderId);
            if (order.getUser() != null && order.getUser().getId() != null) {
                cartService.deleteByUserId(order.getUser().getId());
            }
        }

        response.put("RspCode", "00");
        response.put("Message", "Confirm Success");
        return response;
    }

    private String buildPaymentUrl(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        boolean first = true;

        for (String key : keys) {
            String value = params.get(key);
            if (value == null || value.trim().isEmpty()) {
                continue;
            }

            // Encode cả key lẫn value cho query string
            String encodedKey = encodeAscii(key);
            String encodedValue = encodeAscii(value);

            if (!first) {
                query.append('&');
                hashData.append('&');
            }

            // Query: encode key và value
            query.append(encodedKey).append('=').append(encodedValue);
            // Hash data: key thường + value đã encode (theo spec VNPay)
            hashData.append(key).append('=').append(encodedValue);
            first = false;
        }

        String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Khi verify return/IPN: Spring Boot đã tự decode URL params rồi,
     * KHÔNG encode lại — dùng raw value để tính HMAC.
     * (Nếu encode lại sẽ sai chữ ký → VNPay trả code=97 hoặc lỗi)
     */
    private String buildVerifyHashData(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        boolean first = true;

        for (String key : keys) {
            if ("vnp_SecureHash".equals(key) || "vnp_SecureHashType".equals(key)) {
                continue;
            }

            String value = params.get(key);
            if (value == null || value.trim().isEmpty()) {
                continue;
            }

            if (!first) {
                hashData.append('&');
            }
            // Spring đã decode tham số, ta phải encode lại cả key & value y như vnpay_return.jsp mẫu
            hashData.append(encodeAscii(key)).append('=').append(encodeAscii(value));
            first = false;
        }

        return hashData.toString();
    }

    private String toVnpAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        return amount.multiply(BigDecimal.valueOf(100L)).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String formatTime(Date date) {
        SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss");
        format.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return format.format(date);
    }

    private String encodeAscii(String value) {
        try {
            // VNPay mẫu dùng US_ASCII để encode
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.name());
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException("Không thể mã hóa dữ liệu VNPay", ex);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new RuntimeException("Không thể tạo chữ ký VNPay", ex);
        }
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }
}
