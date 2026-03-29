package com.business.dto;

import java.math.BigDecimal;

public class ReconciliationSummaryDTO {
    private BigDecimal inventoryLedgerValue;
    private BigDecimal inventoryLayerValue;
    private BigDecimal inventoryGap;
    private Long inventoryRowCount;
    private Long layerRowCount;

    public BigDecimal getInventoryLedgerValue() {
        return inventoryLedgerValue;
    }

    public void setInventoryLedgerValue(BigDecimal inventoryLedgerValue) {
        this.inventoryLedgerValue = inventoryLedgerValue;
    }

    public BigDecimal getInventoryLayerValue() {
        return inventoryLayerValue;
    }

    public void setInventoryLayerValue(BigDecimal inventoryLayerValue) {
        this.inventoryLayerValue = inventoryLayerValue;
    }

    public BigDecimal getInventoryGap() {
        return inventoryGap;
    }

    public void setInventoryGap(BigDecimal inventoryGap) {
        this.inventoryGap = inventoryGap;
    }

    public Long getInventoryRowCount() {
        return inventoryRowCount;
    }

    public void setInventoryRowCount(Long inventoryRowCount) {
        this.inventoryRowCount = inventoryRowCount;
    }

    public Long getLayerRowCount() {
        return layerRowCount;
    }

    public void setLayerRowCount(Long layerRowCount) {
        this.layerRowCount = layerRowCount;
    }
}
