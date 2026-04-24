package com.business.entity;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

@Entity
@Table(name = "payable", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "document_code" })
})
public class PayableEntity extends BaseEntity {

    @Column(name = "document_code", nullable = false, length = 64)
    private String documentCode;

    @Column(name = "supplier_name", length = 255)
    private String supplierName;

    @ManyToOne
    @JoinColumn(name = "stock_receipt_id", referencedColumnName = "id", nullable = false)
    private StockReceiptEntity stockReceipt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "due_date")
    private Date dueDate;

    @Column(name = "outstanding_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal outstandingAmount;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "data_version", nullable = false)
    private Integer dataVersion = 1;

    public String getDocumentCode() {
        return documentCode;
    }

    public void setDocumentCode(String documentCode) {
        this.documentCode = documentCode;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public StockReceiptEntity getStockReceipt() {
        return stockReceipt;
    }

    public void setStockReceipt(StockReceiptEntity stockReceipt) {
        this.stockReceipt = stockReceipt;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDataVersion() {
        return dataVersion;
    }

    public void setDataVersion(Integer dataVersion) {
        this.dataVersion = dataVersion;
    }
}
