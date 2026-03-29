package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.InventoryAdjustDTO;
import com.business.dto.InventoryDTO;
import com.business.service.IInventoryService;

@CrossOrigin
@RestController
public class InventoryAPI {

    @Autowired
    private IInventoryService inventoryService;

    @PostMapping(value = "/api/inventory/adjust")
    public ResponseEntity<?> adjust(@RequestBody InventoryAdjustDTO model) {
        try {
            return ResponseEntity.ok(inventoryService.adjustStock(model));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping(value = "/api/inventory")
    public List<InventoryDTO> getAll() {
        return inventoryService.findAll();
    }

    @GetMapping(value = "/api/inventory/warehouse/{warehouseId}")
    public List<InventoryDTO> getByWarehouse(@PathVariable Long warehouseId) {
        return inventoryService.findByWarehouse(warehouseId);
    }
}
