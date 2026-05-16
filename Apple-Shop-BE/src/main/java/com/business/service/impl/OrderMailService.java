package com.business.service.impl;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.business.dto.OrderDTO;
import com.business.dto.OrderItemDTO;
import com.business.entity.OrderEntity;

@Service
public class OrderMailService {

    private static final Logger log = LoggerFactory.getLogger(OrderMailService.class);
    private static final Locale VIETNAMESE = new Locale("vi", "VN");

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public OrderMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmedEmail(OrderEntity orderEntity, OrderDTO orderDTO) {
        sendMail(resolveRecipient(orderEntity, orderDTO),
                "[Apple Shop] Don hang " + safe(orderEntity.getSku()) + " da duoc xac nhan",
                buildOrderConfirmedContent(orderEntity, orderDTO));
    }

    public void sendPaymentSuccessEmail(OrderEntity orderEntity, OrderDTO orderDTO) {
        sendMail(resolveRecipient(orderEntity, orderDTO),
                "[Apple Shop] Thanh toan thanh cong cho don hang " + safe(orderEntity.getSku()),
                buildPaymentSuccessContent(orderEntity, orderDTO));
    }

    private void sendMail(String recipient, String subject, String content) {
        if (!mailEnabled) {
            return;
        }
        if (recipient == null || recipient.trim().isEmpty()) {
            log.warn("Skip sending mail because recipient email is empty");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.trim().isEmpty()) {
                message.setFrom(fromAddress.trim());
            }
            message.setTo(recipient.trim());
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}", recipient, ex);
        }
    }

    private String buildOrderConfirmedContent(OrderEntity orderEntity, OrderDTO orderDTO) {
        StringBuilder builder = new StringBuilder();
        builder.append("Xin chao ").append(safeName(orderEntity, orderDTO)).append(",\n\n");
        builder.append("Don hang ").append(safe(orderEntity.getSku())).append(" cua ban da duoc xac nhan thanh cong.\n");
        builder.append("Thong tin don hang:\n");
        appendCommonOrderInfo(builder, orderEntity, orderDTO);
        builder.append("\nCam on ban da mua sam tai Apple Shop.");
        return builder.toString();
    }

    private String buildPaymentSuccessContent(OrderEntity orderEntity, OrderDTO orderDTO) {
        StringBuilder builder = new StringBuilder();
        builder.append("Xin chao ").append(safeName(orderEntity, orderDTO)).append(",\n\n");
        builder.append("Apple Shop da ghi nhan thanh toan thanh cong cho don hang ")
                .append(safe(orderEntity.getSku())).append(".\n");
        builder.append("Thong tin thanh toan:\n");
        appendCommonOrderInfo(builder, orderEntity, orderDTO);
        builder.append("- Trang thai thanh toan: Da thanh toan\n");
        builder.append("- Phuong thuc thanh toan: ").append(safe(orderEntity.getPaymentMethod())).append("\n");
        builder.append("\nCam on ban da mua sam tai Apple Shop.");
        return builder.toString();
    }

    private void appendCommonOrderInfo(StringBuilder builder, OrderEntity orderEntity, OrderDTO orderDTO) {
        builder.append("- Ma don hang: ").append(safe(orderEntity.getSku())).append("\n");
        builder.append("- Tong tien: ").append(formatCurrency(orderEntity.getTotalPrice())).append("\n");
        builder.append("- Dia chi nhan hang: ").append(safe(orderEntity.getOrderAddress())).append("\n");
        builder.append("- So dien thoai: ").append(safe(orderEntity.getOrderPhone())).append("\n");
        if (orderEntity.getOrderTime() != null) {
            builder.append("- Thoi gian dat hang: ")
                    .append(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(orderEntity.getOrderTime()))
                    .append("\n");
        }

        List<OrderItemDTO> items = orderDTO == null ? null : orderDTO.getOrderItemDTOs();
        if (items != null && !items.isEmpty()) {
            builder.append("- San pham:\n");
            for (OrderItemDTO item : items) {
                builder.append("  + ").append(safe(item.getName()))
                        .append(" x").append(item.getQuantity());
                if (item.getMemory() != null && !item.getMemory().trim().isEmpty()) {
                    builder.append(" - ").append(item.getMemory().trim());
                }
                if (item.getColor() != null && !item.getColor().trim().isEmpty()) {
                    builder.append(" - ").append(item.getColor().trim());
                }
                if (item.getPrice() != null) {
                    builder.append(" - ").append(formatCurrency(item.getPrice()));
                }
                builder.append("\n");
            }
        }
    }

    private String resolveRecipient(OrderEntity orderEntity, OrderDTO orderDTO) {
        if (orderEntity.getEmail() != null && !orderEntity.getEmail().trim().isEmpty()) {
            return orderEntity.getEmail().trim();
        }
        if (orderDTO != null && orderDTO.getEmail() != null && !orderDTO.getEmail().trim().isEmpty()) {
            return orderDTO.getEmail().trim();
        }
        if (orderEntity.getUser() != null && orderEntity.getUser().getEmail() != null) {
            return orderEntity.getUser().getEmail().trim();
        }
        return null;
    }

    private String safeName(OrderEntity orderEntity, OrderDTO orderDTO) {
        if (orderEntity.getFullName() != null && !orderEntity.getFullName().trim().isEmpty()) {
            return orderEntity.getFullName().trim();
        }
        if (orderDTO != null && orderDTO.getFullName() != null && !orderDTO.getFullName().trim().isEmpty()) {
            return orderDTO.getFullName().trim();
        }
        return "quy khach";
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0 VND";
        }
        return NumberFormat.getCurrencyInstance(VIETNAMESE).format(amount);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
