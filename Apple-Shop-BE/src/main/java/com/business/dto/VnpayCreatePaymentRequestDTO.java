package com.business.dto;

public class VnpayCreatePaymentRequestDTO {
    private OrderDTO order;
    private String returnUrl;

    public OrderDTO getOrder() {
        return order;
    }

    public void setOrder(OrderDTO order) {
        this.order = order;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }
}