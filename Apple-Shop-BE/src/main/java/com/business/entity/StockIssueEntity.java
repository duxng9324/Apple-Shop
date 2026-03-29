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
@Table(name = "stock_issue")
public class StockIssueEntity extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "issue_date", nullable = false)
    private Date issueDate;

    @Column(name = "note")
    private String note;

    @Column(name = "total_cost", precision = 19, scale = 2)
    private BigDecimal totalCost;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", referencedColumnName = "id", nullable = false)
    private WarehouseEntity warehouse;

    @OneToMany(mappedBy = "stockIssue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockIssueItemEntity> items = new ArrayList<>();

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Date getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Date issueDate) {
        this.issueDate = issueDate;
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

    public List<StockIssueItemEntity> getItems() {
        return items;
    }

    public void setItems(List<StockIssueItemEntity> items) {
        this.items = items;
    }
}
