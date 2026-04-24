package com.business.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.InventoryEntity;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {

    List<InventoryEntity> findByWarehouseId(Long warehouseId);

    List<InventoryEntity> findByProductId(Long productId);

    Optional<InventoryEntity> findByWarehouseIdAndProductIdAndMemoryType(Long warehouseId, Long productId, String memoryType);

    Optional<InventoryEntity> findByWarehouseIdAndProductIdAndColorIdAndMemoryType(Long warehouseId, Long productId,
            Long colorId, String memoryType);

    List<InventoryEntity> findByProductIdAndMemoryTypeAndQuantityGreaterThanOrderByQuantityDesc(Long productId, String memoryType, Integer quantity);

    List<InventoryEntity> findByProductIdAndColorIdAndMemoryTypeAndQuantityGreaterThanOrderByQuantityDesc(Long productId,
            Long colorId, String memoryType, Integer quantity);

    List<InventoryEntity> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    List<InventoryEntity> findByWarehouseIdAndProductIdAndColorId(Long warehouseId, Long productId, Long colorId);

    List<InventoryEntity> findByProductIdAndQuantityGreaterThanOrderByQuantityDesc(Long productId, Integer quantity);

    List<InventoryEntity> findByProductIdAndColorIdAndQuantityGreaterThanOrderByQuantityDesc(Long productId,
            Long colorId, Integer quantity);

    List<InventoryEntity> findByProductCodeAndQuantityGreaterThan(String productCode, Integer quantity);

    boolean existsByProductCodeAndMemoryTypeAndQuantityGreaterThan(String productCode, String memoryType, Integer quantity);

    boolean existsByProductIdAndQuantityGreaterThan(Long productId, Integer quantity);
}
