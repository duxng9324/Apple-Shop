package com.business.dto;

import java.math.BigDecimal;
import java.util.Date;

public class AccountingReportDTO {
    private Date fromDate;
    private Date toDate;
    private BigDecimal revenue;
    private BigDecimal costOfGoodsSold;
    private BigDecimal grossProfit;
    private BigDecimal grossMarginPercent;
    private Integer totalOrders;
    private Integer totalStockIssueVouchers;

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

    public BigDecimal getGrossProfit() {
        return grossProfit;
    }

    public void setGrossProfit(BigDecimal grossProfit) {
        this.grossProfit = grossProfit;
    }

    public BigDecimal getGrossMarginPercent() {
        return grossMarginPercent;
    }

    public void setGrossMarginPercent(BigDecimal grossMarginPercent) {
        this.grossMarginPercent = grossMarginPercent;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Integer getTotalStockIssueVouchers() {
        return totalStockIssueVouchers;
    }

    public void setTotalStockIssueVouchers(Integer totalStockIssueVouchers) {
        this.totalStockIssueVouchers = totalStockIssueVouchers;
    }
}
