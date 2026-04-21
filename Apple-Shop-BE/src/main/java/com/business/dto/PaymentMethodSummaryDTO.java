package com.business.dto;

import java.math.BigDecimal;

public class PaymentMethodSummaryDTO {
    private String paymentMethod;
    private BigDecimal amount;

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
