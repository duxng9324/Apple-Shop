package com.business.service.impl;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
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
import com.business.entity.OrderEntity;
import com.business.repository.OrderRepository;
import com.business.service.ICartService;

@Service
public class VnpayService {

    private static final String VNPAY_VERSION = "2.1.0";
    private static final String VNPAY_COMMAND = "pay";
    private static final String VNPAY_CURRENCY = "VND";
    private static final String VNPAY_LOCALE = "vn";

    @Value("${vnpay.tmn-code:G1UDJTEN}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret:HT3JN0IT5FVWFAVUVXXV6HQLHPTHCT9S}")
    private String vnpHashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.ipn-url:http://localhost:8081/api/vnpay/ipn}")
    private String defaultIpnUrl;

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

        String returnUrl = request.getReturnUrl();
        if (returnUrl == null || returnUrl.trim().isEmpty()) {
            throw new RuntimeException("Thiếu returnUrl cho VNPay");
        }

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", toVnpAmount(savedOrder.getTotalPrice()));
        params.put("vnp_Command", VNPAY_COMMAND);
        params.put("vnp_CreateDate", formatTime(new Date()));
        params.put("vnp_CurrCode", VNPAY_CURRENCY);
        params.put("vnp_ExpireDate", formatTime(new Date(System.currentTimeMillis() + 15 * 60 * 1000L)));
        params.put("vnp_IpAddr", clientIp == null || clientIp.trim().isEmpty() ? "127.0.0.1" : clientIp);
        params.put("vnp_IpnUrl", defaultIpnUrl);
        params.put("vnp_Locale", VNPAY_LOCALE);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + safeText(savedOrder.getSku()));
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_SecureHashType", "HmacSHA512");
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_TxnRef", String.valueOf(savedOrder.getId()));
        params.put("vnp_Version", VNPAY_VERSION);

        String paymentUrl = buildPaymentUrl(params);
        return new VnpayCreatePaymentResponseDTO(paymentUrl, savedOrder.getId(), savedOrder.getSku());
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
        String computedHash = hmacSHA512(vnpHashSecret, buildHashData(inputParams));
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

            String encodedKey = encode(key);
            String encodedValue = encode(value);
            if (!first) {
                query.append('&');
            }
            query.append(encodedKey).append('=').append(encodedValue);
            if (!"vnp_SecureHashType".equals(key) && !"vnp_SecureHash".equals(key)) {
                if (hashData.length() > 0) {
                    hashData.append('&');
                }
                hashData.append(key).append('=').append(value);
            }
            first = false;
        }

        String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private String buildHashData(Map<String, String> params) {
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
            hashData.append(key).append('=').append(value);
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
        java.text.SimpleDateFormat format = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        format.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return format.format(date);
    }

    private String encode(String value) {
        try {
            return URLEncoder.encode(value, "UTF-8").replace("+", "%20");
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException("Không thể mã hóa dữ liệu VNPay", ex);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hash = hmac512.doFinal(data.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException | UnsupportedEncodingException ex) {
            throw new RuntimeException("Không thể tạo chữ ký VNPay", ex);
        }
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }
}