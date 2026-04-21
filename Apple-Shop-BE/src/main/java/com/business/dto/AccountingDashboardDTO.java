package com.business.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class AccountingDashboardDTO {
    private Date fromDate;
    private Date toDate;
    private BigDecimal revenue;
    private BigDecimal costOfGoodsSold;
    private BigDecimal expense;
    private BigDecimal profit;
    private BigDecimal grossMarginPercent;
    private BigDecimal netCashInflow;
    private BigDecimal avgOrderValue;
    private Integer totalOrders;
    private List<DashboardTrendPointDTO> monthlyTrend = new ArrayList<>();
    private List<ProductSaleRatioDTO> productSaleRatios = new ArrayList<>();
    private List<ExpenseCategorySummaryDTO> expenseByCategory = new ArrayList<>();
    private List<PaymentMethodSummaryDTO> paymentMethodBreakdown = new ArrayList<>();

    public Date getFromDate() {
        return fromDate;
    }

    public void setFromDate(Date fromDate) {
        this.fromDate = fromDate;
    }

    public Date getToDate() {
        return toDate;
    }

    public void setToDate(Date toDate) {
        this.toDate = toDate;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public BigDecimal getCostOfGoodsSold() {
        return costOfGoodsSold;
    }

    public void setCostOfGoodsSold(BigDecimal costOfGoodsSold) {
        this.costOfGoodsSold = costOfGoodsSold;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public void setProfit(BigDecimal profit) {
        this.profit = profit;
    }

    public BigDecimal getGrossMarginPercent() {
        return grossMarginPercent;
    }

    public void setGrossMarginPercent(BigDecimal grossMarginPercent) {
        this.grossMarginPercent = grossMarginPercent;
    }

    public BigDecimal getNetCashInflow() {
        return netCashInflow;
    }

    public void setNetCashInflow(BigDecimal netCashInflow) {
        this.netCashInflow = netCashInflow;
    }

    public BigDecimal getAvgOrderValue() {
        return avgOrderValue;
    }

    public void setAvgOrderValue(BigDecimal avgOrderValue) {
        this.avgOrderValue = avgOrderValue;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public List<DashboardTrendPointDTO> getMonthlyTrend() {
        return monthlyTrend;
    }

    public void setMonthlyTrend(List<DashboardTrendPointDTO> monthlyTrend) {
        this.monthlyTrend = monthlyTrend;
    }

    public List<ProductSaleRatioDTO> getProductSaleRatios() {
        return productSaleRatios;
    }

    public void setProductSaleRatios(List<ProductSaleRatioDTO> productSaleRatios) {
        this.productSaleRatios = productSaleRatios;
    }

    public List<ExpenseCategorySummaryDTO> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(List<ExpenseCategorySummaryDTO> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public List<PaymentMethodSummaryDTO> getPaymentMethodBreakdown() {
        return paymentMethodBreakdown;
    }

    public void setPaymentMethodBreakdown(List<PaymentMethodSummaryDTO> paymentMethodBreakdown) {
        this.paymentMethodBreakdown = paymentMethodBreakdown;
    }
}
