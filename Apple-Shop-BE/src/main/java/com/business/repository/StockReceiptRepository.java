package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.StockReceiptEntity;

@Repository
public interface StockReceiptRepository extends JpaRepository<StockReceiptEntity, Long> {
    List<StockReceiptEntity> findByWarehouseId(Long warehouseId);

    List<StockReceiptEntity> findByReceiptDateBetween(Date fromDate, Date toDate);
}
