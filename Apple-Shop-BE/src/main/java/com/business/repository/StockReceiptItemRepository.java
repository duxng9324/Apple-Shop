package com.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.StockReceiptItemEntity;

@Repository
public interface StockReceiptItemRepository extends JpaRepository<StockReceiptItemEntity, Long> {

    List<StockReceiptItemEntity> findByProductIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateAscIdAsc(
            Long productId, String memoryType, Integer remainingQuantity);

    List<StockReceiptItemEntity> findByProductIdAndColorIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateAscIdAsc(
            Long productId, Long colorId, String memoryType, Integer remainingQuantity);

    List<StockReceiptItemEntity> findByProductIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateDescIdDesc(
            Long productId, String memoryType, Integer remainingQuantity);

    List<StockReceiptItemEntity> findByProductIdAndColorIdAndMemoryTypeAndRemainingQuantityGreaterThanOrderByStockReceiptReceiptDateDescIdDesc(
            Long productId, Long colorId, String memoryType, Integer remainingQuantity);
}
