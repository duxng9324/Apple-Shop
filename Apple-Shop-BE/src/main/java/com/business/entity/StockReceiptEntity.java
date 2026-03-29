package com.business.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "stock_receipt")
public class StockReceiptEntity extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "receipt_date", nullable = false)
    private Date receiptDate;

    @Column(name = "supplier")
    private String supplier;

    @Column(name = "note")
    private String note;

    @Column(name = "total_cost", precision = 19, scale = 2)
    private BigDecimal totalCost;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", referencedColumnName = "id", nullable = false)
    private WarehouseEntity warehouse;

    @OneToMany(mappedBy = "stockReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockReceiptItemEntity> items = new ArrayList<>();

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Date getReceiptDate() {
        return receiptDate;
    }

    public void setReceiptDate(Date receiptDate) {
        this.receiptDate = receiptDate;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public WarehouseEntity getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(WarehouseEntity warehouse) {
        this.warehouse = warehouse;
    }

    public List<StockReceiptItemEntity> getItems() {
        return items;
    }

    public void setItems(List<StockReceiptItemEntity> items) {
        this.items = items;
    }
}
