package com.business.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.dto.StockIssueDTO;
import com.business.dto.StockIssueItemDTO;
import com.business.entity.ColorEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.ProductEntity;
import com.business.entity.StockIssueEntity;
import com.business.entity.StockIssueItemEntity;
import com.business.entity.WarehouseEntity;
import com.business.repository.InventoryRepository;
import com.business.repository.ColorRepository;
import com.business.repository.ProductRepository;
import com.business.repository.StockIssueRepository;
import com.business.repository.WarehouseRepository;
import com.business.service.IStockIssueService;

@Service
public class StockIssueService implements IStockIssueService {

    @Autowired
    private StockIssueRepository stockIssueRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private AccountingPostingService accountingPostingService;

    @Override
    @Transactional
    public StockIssueDTO createVoucher(StockIssueDTO stockIssueDTO) {
        if (stockIssueDTO.getWarehouseId() == null) {
            throw new RuntimeException("warehouseId là bắt buộc");
        }
        if (stockIssueDTO.getItems() == null || stockIssueDTO.getItems().isEmpty()) {
            throw new RuntimeException("Phiếu xuất phải có ít nhất một dòng hàng");
        }

        WarehouseEntity warehouse = warehouseRepository.findById(stockIssueDTO.getWarehouseId()).orElse(null);
        if (warehouse == null) {
            throw new RuntimeException("Không tìm thấy kho");
        }

        StockIssueEntity issue = new StockIssueEntity();
        issue.setCode(generateIssueCode());
        issue.setIssueDate(new Date());
        issue.setWarehouse(warehouse);
        issue.setNote(stockIssueDTO.getNote());
        issue.setTotalCost(BigDecimal.ZERO);

        List<StockIssueItemEntity> issueItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (StockIssueItemDTO itemDTO : stockIssueDTO.getItems()) {
            if (itemDTO.getProductId() == null || itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                throw new RuntimeException("Dòng hàng trong phiếu xuất không hợp lệ");
            }

            String memoryType = itemDTO.getMemoryType() == null ? "DEFAULT" : itemDTO.getMemoryType().trim().toUpperCase();
            ColorEntity color = null;
            if (itemDTO.getColorId() != null) {
                color = colorRepository.findById(itemDTO.getColorId()).orElse(null);
            }

            ProductEntity product = productRepository.findById(itemDTO.getProductId()).orElse(null);
            if (product == null) {
                throw new RuntimeException("Không tìm thấy sản phẩm: " + itemDTO.getProductId());
            }

            InventoryEntity inventory;
            if (color != null) {
                inventory = inventoryRepository
                        .findByWarehouseIdAndProductIdAndColorIdAndMemoryType(warehouse.getId(), product.getId(),
                                color.getId(), memoryType)
                        .orElse(null);
            } else {
                inventory = inventoryRepository
                        .findByWarehouseIdAndProductIdAndMemoryType(warehouse.getId(), product.getId(), memoryType)
                        .orElse(null);
            }

            if (inventory == null || inventory.getQuantity() == null || inventory.getQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Tồn kho không đủ cho sản phẩm " + product.getCode() + " - " + memoryType);
            }

            BigDecimal unitCost = itemDTO.getUnitCost() != null
                    ? itemDTO.getUnitCost()
                    : (inventory.getUnitCost() == null ? BigDecimal.ZERO : inventory.getUnitCost());

            BigDecimal lineTotal = unitCost.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));

            inventory.setQuantity(inventory.getQuantity() - itemDTO.getQuantity());
            inventoryRepository.save(inventory);

            StockIssueItemEntity issueItem = new StockIssueItemEntity();
            issueItem.setStockIssue(issue);
            issueItem.setProduct(product);
            issueItem.setColor(color);
            issueItem.setMemoryType(memoryType);
            issueItem.setQuantity(itemDTO.getQuantity());
            issueItem.setUnitCost(unitCost);
            issueItem.setLineTotal(lineTotal);

            issueItems.add(issueItem);
            total = total.add(lineTotal);
        }

        issue.setItems(issueItems);
        issue.setTotalCost(total);

        StockIssueEntity saved = stockIssueRepository.save(issue);
        accountingPostingService.postStockIssue(saved);
        return toDTO(saved);
    }

    @Override
    public List<StockIssueDTO> findAll() {
        List<StockIssueDTO> dtos = new ArrayList<>();
        for (StockIssueEntity entity : stockIssueRepository.findAll()) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    @Override
    public List<StockIssueDTO> findByWarehouse(Long warehouseId) {
        List<StockIssueDTO> dtos = new ArrayList<>();
        for (StockIssueEntity entity : stockIssueRepository.findByWarehouseId(warehouseId)) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    private StockIssueDTO toDTO(StockIssueEntity entity) {
        StockIssueDTO dto = new StockIssueDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setIssueDate(entity.getIssueDate());
        dto.setNote(entity.getNote());
        dto.setTotalCost(entity.getTotalCost());
        dto.setWarehouseId(entity.getWarehouse().getId());
        dto.setWarehouseCode(entity.getWarehouse().getCode());
        dto.setWarehouseName(entity.getWarehouse().getName());

        List<StockIssueItemDTO> itemDTOs = new ArrayList<>();
        for (StockIssueItemEntity item : entity.getItems()) {
            StockIssueItemDTO itemDTO = new StockIssueItemDTO();
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductCode(item.getProduct().getCode());
            itemDTO.setProductName(item.getProduct().getName());
            if (item.getColor() != null) {
                itemDTO.setColorId(item.getColor().getId());
                itemDTO.setColorName(item.getColor().getColor());
            }
            itemDTO.setMemoryType(item.getMemoryType());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setUnitCost(item.getUnitCost());
            itemDTO.setLineTotal(item.getLineTotal());
            itemDTOs.add(itemDTO);
        }

        dto.setItems(itemDTOs);
        return dto;
    }

    private String generateIssueCode() {
        long now = System.currentTimeMillis();
        int random = (int) (Math.random() * 9000) + 1000;
        return "PXK-" + now + "-" + random;
    }
}
