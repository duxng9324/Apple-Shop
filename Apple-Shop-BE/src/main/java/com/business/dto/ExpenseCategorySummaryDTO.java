package com.business.dto;

import java.math.BigDecimal;

public class ExpenseCategorySummaryDTO {
    private String expenseCategory;
    private BigDecimal amount;

    public String getExpenseCategory() {
        return expenseCategory;
    }

    public void setExpenseCategory(String expenseCategory) {
        this.expenseCategory = expenseCategory;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
