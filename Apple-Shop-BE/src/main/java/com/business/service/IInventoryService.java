package com.business.service;

import java.util.List;

import com.business.dto.InventoryAdjustDTO;
import com.business.dto.InventoryDTO;

public interface IInventoryService {
    InventoryDTO adjustStock(InventoryAdjustDTO adjustDTO);

    List<InventoryDTO> findAll();

    List<InventoryDTO> findByWarehouse(Long warehouseId);
}
