package com.business.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.dto.InventoryAdjustDTO;
import com.business.dto.InventoryDTO;
import com.business.entity.ColorEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.ProductEntity;
import com.business.entity.WarehouseEntity;
import com.business.repository.ColorRepository;
import com.business.repository.InventoryRepository;
import com.business.repository.ProductRepository;
import com.business.repository.WarehouseRepository;
import com.business.service.IInventoryService;

@Service
public class InventoryService implements IInventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Override
    @Transactional
    public InventoryDTO adjustStock(InventoryAdjustDTO adjustDTO) {
        if (adjustDTO.getWarehouseId() == null || adjustDTO.getProductId() == null || adjustDTO.getMemoryType() == null) {
            throw new RuntimeException("warehouseId, productId, memoryType là bắt buộc");
        }

        Integer requestedDelta = adjustDTO.getQuantityDelta();
        Integer delta = requestedDelta == null ? 0 : requestedDelta;
        if (delta == 0) {
            throw new RuntimeException("quantityDelta phải khác 0");
        }
        if (delta > 0) {
            throw new RuntimeException("Không được tăng tồn kho qua điều chỉnh. Vui lòng nhập qua phiếu nhập.");
        }

        WarehouseEntity warehouse = warehouseRepository.findById(adjustDTO.getWarehouseId()).orElse(null);
        ProductEntity product = productRepository.findById(adjustDTO.getProductId()).orElse(null);
        if (warehouse == null || product == null) {
            throw new RuntimeException("Không tìm thấy kho hoặc sản phẩm");
        }

        ColorEntity color = null;
        if (adjustDTO.getColorId() != null) {
            color = colorRepository.findById(adjustDTO.getColorId()).orElse(null);
            if (color == null) {
                throw new RuntimeException("Không tìm thấy màu sắc");
            }
        }

        String memoryType = adjustDTO.getMemoryType().trim().toUpperCase();
        InventoryEntity entity;
        if (color != null) {
            entity = inventoryRepository
                    .findByWarehouseIdAndProductIdAndColorIdAndMemoryType(warehouse.getId(), product.getId(),
                            color.getId(), memoryType)
                    .orElse(null);
        } else {
            entity = inventoryRepository
                    .findByWarehouseIdAndProductIdAndMemoryType(warehouse.getId(), product.getId(), memoryType)
                    .orElse(null);
        }

        if (entity == null) {
            entity = new InventoryEntity();
            entity.setWarehouse(warehouse);
            entity.setProduct(product);
            entity.setColor(color);
            entity.setMemoryType(memoryType);
            entity.setQuantity(0);
            entity.setUnitCost(adjustDTO.getUnitCost() == null ? BigDecimal.ZERO : adjustDTO.getUnitCost());
        }

        Integer currentQuantity = entity.getQuantity();
        Integer safeCurrentQuantity = currentQuantity == null ? 0 : currentQuantity;
        Integer newQuantity = Integer.sum(safeCurrentQuantity, delta);
        if (newQuantity.compareTo(0) < 0) {
            throw new RuntimeException("Số lượng tồn kho không đủ");
        }

        entity.setQuantity(newQuantity);
        if (adjustDTO.getUnitCost() != null) {
            entity.setUnitCost(adjustDTO.getUnitCost());
        }

        return toDTO(inventoryRepository.save(entity));
    }

    @Override
    public List<InventoryDTO> findAll() {
        List<InventoryDTO> dtos = new ArrayList<>();
        for (InventoryEntity entity : inventoryRepository.findAll()) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    @Override
    public List<InventoryDTO> findByWarehouse(Long warehouseId) {
        List<InventoryDTO> dtos = new ArrayList<>();
        for (InventoryEntity entity : inventoryRepository.findByWarehouseId(warehouseId)) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    private InventoryDTO toDTO(InventoryEntity entity) {
        InventoryDTO dto = new InventoryDTO();
        dto.setId(entity.getId());
        dto.setWarehouseId(entity.getWarehouse().getId());
        dto.setWarehouseCode(entity.getWarehouse().getCode());
        dto.setWarehouseName(entity.getWarehouse().getName());
        dto.setProductId(entity.getProduct().getId());
        dto.setProductCode(entity.getProduct().getCode());
        dto.setProductName(entity.getProduct().getName());
        if (entity.getColor() != null) {
            dto.setColorId(entity.getColor().getId());
            dto.setColorName(entity.getColor().getColor());
        }
        dto.setMemoryType(entity.getMemoryType());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitCost(entity.getUnitCost());

        BigDecimal unitCost = entity.getUnitCost() == null ? BigDecimal.ZERO : entity.getUnitCost();
        Integer rawQuantity = entity.getQuantity();
        Integer safeQuantity = rawQuantity == null ? 0 : rawQuantity;
        dto.setStockValue(unitCost.multiply(BigDecimal.valueOf(safeQuantity.longValue())));
        return dto;
    }
}
