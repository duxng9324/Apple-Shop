package com.business.dto;

import java.math.BigDecimal;

public class ProductSaleRatioDTO {
    private String productName;
    private Integer quantitySold;
    private BigDecimal ratioPercent;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Integer quantitySold) {
        this.quantitySold = quantitySold;
    }

    public BigDecimal getRatioPercent() {
        return ratioPercent;
    }

    public void setRatioPercent(BigDecimal ratioPercent) {
        this.ratioPercent = ratioPercent;
    }
}
