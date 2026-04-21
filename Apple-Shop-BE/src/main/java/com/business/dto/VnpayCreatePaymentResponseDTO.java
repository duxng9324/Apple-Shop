package com.business.dto;

public class VnpayCreatePaymentResponseDTO {
    private String paymentUrl;
    private Long orderId;
    private String orderCode;

    public VnpayCreatePaymentResponseDTO() {
    }

    public VnpayCreatePaymentResponseDTO(String paymentUrl, Long orderId, String orderCode) {
        this.paymentUrl = paymentUrl;
        this.orderId = orderId;
        this.orderCode = orderCode;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }
}