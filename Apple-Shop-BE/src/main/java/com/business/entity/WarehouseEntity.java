package com.business.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "warehouse")
public class WarehouseEntity extends BaseEntity {

    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "active")
    private Boolean active = true;

    @OneToMany(mappedBy = "warehouse")
    private List<InventoryEntity> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse")
    private List<StockIssueEntity> stockIssues = new ArrayList<>();

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<InventoryEntity> getInventories() {
        return inventories;
    }

    public void setInventories(List<InventoryEntity> inventories) {
        this.inventories = inventories;
    }

    public List<StockIssueEntity> getStockIssues() {
        return stockIssues;
    }

    public void setStockIssues(List<StockIssueEntity> stockIssues) {
        this.stockIssues = stockIssues;
    }
}
