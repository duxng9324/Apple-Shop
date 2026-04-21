package com.business.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.dto.StockReceiptDTO;
import com.business.dto.StockReceiptItemDTO;
import com.business.entity.CategoryEntity;
import com.business.entity.ColorEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.MemoryEntity;
import com.business.entity.ProductEntity;
import com.business.entity.ProductMemoryEntity;
import com.business.entity.StockReceiptEntity;
import com.business.entity.StockReceiptItemEntity;
import com.business.entity.WarehouseEntity;
import com.business.repository.CategoryRepository;
import com.business.repository.ColorRepository;
import com.business.repository.InventoryRepository;
import com.business.repository.MemoryRepository;
import com.business.repository.ProductMemoryRepository;
import com.business.repository.ProductRepository;
import com.business.repository.StockReceiptRepository;
import com.business.repository.WarehouseRepository;
import com.business.service.IStockReceiptService;

@Service
public class StockReceiptService implements IStockReceiptService {

    @Autowired
    private StockReceiptRepository stockReceiptRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private MemoryRepository memoryRepository;

    @Autowired
    private ProductMemoryRepository productMemoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private AccountingPostingService accountingPostingService;

    @Override
    @Transactional
    public StockReceiptDTO createVoucher(StockReceiptDTO stockReceiptDTO) {
        if (stockReceiptDTO.getWarehouseId() == null) {
            throw new RuntimeException("warehouseId là bắt buộc");
        }
        if (stockReceiptDTO.getItems() == null || stockReceiptDTO.getItems().isEmpty()) {
            throw new RuntimeException("Phiếu nhập phải có ít nhất một dòng hàng");
        }

        WarehouseEntity warehouse = warehouseRepository.findById(stockReceiptDTO.getWarehouseId()).orElse(null);
        if (warehouse == null) {
            throw new RuntimeException("Không tìm thấy kho");
        }

        StockReceiptEntity receipt = new StockReceiptEntity();
        receipt.setCode(generateReceiptCode());
        receipt.setReceiptDate(new Date());
        receipt.setWarehouse(warehouse);
        receipt.setSupplier(stockReceiptDTO.getSupplier());
        receipt.setNote(stockReceiptDTO.getNote());
        receipt.setTotalCost(BigDecimal.ZERO);

        List<StockReceiptItemEntity> receiptItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (StockReceiptItemDTO itemDTO : stockReceiptDTO.getItems()) {
            if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                throw new RuntimeException("Dòng hàng trong phiếu nhập không hợp lệ");
            }

            String memoryType = itemDTO.getMemoryType() == null ? "DEFAULT" : itemDTO.getMemoryType().trim().toUpperCase();
            ColorEntity color = resolveColor(itemDTO);
            ProductEntity product = resolveOrCreateProduct(itemDTO);
            ensureProductColor(product, color);

            BigDecimal unitCost = itemDTO.getUnitCost() == null ? BigDecimal.ZERO : itemDTO.getUnitCost();
            BigDecimal lineTotal = unitCost.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));

            ensureProductMemory(product, memoryType, unitCost);

            InventoryEntity inventory = inventoryRepository
                    .findByWarehouseIdAndProductIdAndColorIdAndMemoryType(warehouse.getId(), product.getId(),
                            color == null ? null : color.getId(), memoryType)
                    .orElse(null);
            if (inventory == null) {
                inventory = new InventoryEntity();
                inventory.setWarehouse(warehouse);
                inventory.setProduct(product);
                inventory.setColor(color);
                inventory.setMemoryType(memoryType);
                inventory.setQuantity(0);
                inventory.setUnitCost(unitCost);
            }

            Integer currentQty = inventory.getQuantity();
            int safeCurrentQty = currentQty == null ? 0 : currentQty;
            inventory.setQuantity(safeCurrentQty + itemDTO.getQuantity());
            inventory.setUnitCost(unitCost);
            inventoryRepository.save(inventory);

            StockReceiptItemEntity receiptItem = new StockReceiptItemEntity();
            receiptItem.setStockReceipt(receipt);
            receiptItem.setProduct(product);
            receiptItem.setColor(color);
            receiptItem.setMemoryType(memoryType);
            receiptItem.setQuantity(itemDTO.getQuantity());
            receiptItem.setRemainingQuantity(itemDTO.getQuantity());
            receiptItem.setUnitCost(unitCost);
            receiptItem.setLineTotal(lineTotal);

            receiptItems.add(receiptItem);
            total = total.add(lineTotal);
        }

        receipt.setItems(receiptItems);
        receipt.setTotalCost(total);
        StockReceiptEntity saved = stockReceiptRepository.save(receipt);
        accountingPostingService.postStockReceipt(saved);
        return toDTO(saved);
    }

    @Override
    public List<StockReceiptDTO> findAll() {
        List<StockReceiptDTO> dtos = new ArrayList<>();
        for (StockReceiptEntity entity : stockReceiptRepository.findAll()) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    @Override
    public List<StockReceiptDTO> findByWarehouse(Long warehouseId) {
        List<StockReceiptDTO> dtos = new ArrayList<>();
        for (StockReceiptEntity entity : stockReceiptRepository.findByWarehouseId(warehouseId)) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    private StockReceiptDTO toDTO(StockReceiptEntity entity) {
        StockReceiptDTO dto = new StockReceiptDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setReceiptDate(entity.getReceiptDate());
        dto.setSupplier(entity.getSupplier());
        dto.setNote(entity.getNote());
        dto.setTotalCost(entity.getTotalCost());
        dto.setWarehouseId(entity.getWarehouse().getId());
        dto.setWarehouseCode(entity.getWarehouse().getCode());
        dto.setWarehouseName(entity.getWarehouse().getName());

        List<StockReceiptItemDTO> items = new ArrayList<>();
        for (StockReceiptItemEntity item : entity.getItems()) {
            StockReceiptItemDTO itemDTO = new StockReceiptItemDTO();
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductCode(item.getProduct().getCode());
            itemDTO.setProductName(item.getProduct().getName());
            if (item.getColor() != null) {
                itemDTO.setColorId(item.getColor().getId());
                itemDTO.setColorName(item.getColor().getColor());
            }
            itemDTO.setMemoryType(item.getMemoryType());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setRemainingQuantity(item.getRemainingQuantity());
            itemDTO.setUnitCost(item.getUnitCost());
            itemDTO.setLineTotal(item.getLineTotal());
            items.add(itemDTO);
        }
        dto.setItems(items);
        return dto;
    }

    private String generateReceiptCode() {
        long now = System.currentTimeMillis();
        int random = (int) (Math.random() * 9000) + 1000;
        return "PNK-" + now + "-" + random;
    }

    private ProductEntity resolveOrCreateProduct(StockReceiptItemDTO itemDTO) {
        if (itemDTO.getProductId() != null) {
            ProductEntity byId = productRepository.findById(itemDTO.getProductId()).orElse(null);
            if (byId != null) {
                return byId;
            }
        }

        String productCode = itemDTO.getProductCode() == null ? "" : itemDTO.getProductCode().trim();
        if (!productCode.isEmpty()) {
            ProductEntity byCode = productRepository.findByCode(productCode);
            if (byCode != null) {
                return byCode;
            }
        }

        if (productCode.isEmpty()) {
            throw new RuntimeException("Thiếu productId hoặc productCode trong phiếu nhập");
        }

        String productName = itemDTO.getProductName() == null ? "" : itemDTO.getProductName().trim();
        String categoryCode = itemDTO.getCategoryCode() == null ? "" : itemDTO.getCategoryCode().trim();
        if (productName.isEmpty() || categoryCode.isEmpty()) {
            throw new RuntimeException("Sản phẩm mới cần đủ productCode, productName, categoryCode");
        }

        CategoryEntity category = categoryRepository.findByCode(categoryCode);
        if (category == null) {
            throw new RuntimeException("categoryCode không tồn tại: " + categoryCode);
        }

        ProductEntity newProduct = new ProductEntity();
        newProduct.setCode(productCode);
        newProduct.setName(productName);
        newProduct.setDescription("Tạo tự động từ phiếu nhập");
        newProduct.setCategory(category);
        return productRepository.save(newProduct);
    }

    private ColorEntity resolveColor(StockReceiptItemDTO itemDTO) {
        if (itemDTO.getColorId() != null) {
            ColorEntity byId = colorRepository.findById(itemDTO.getColorId()).orElse(null);
            if (byId != null) {
                return byId;
            }
        }

        String colorName = itemDTO.getColorName() == null ? "" : itemDTO.getColorName().trim();
        if (colorName.isEmpty()) {
            return null;
        }

        ColorEntity byName = colorRepository.findByColorIgnoreCase(colorName);
        if (byName != null) {
            return byName;
        }

        throw new RuntimeException("Màu không tồn tại: " + colorName);
    }

    private void ensureProductMemory(ProductEntity product, String memoryType, BigDecimal unitCost) {
        MemoryEntity memoryEntity = memoryRepository.findByType(memoryType);
        if (memoryEntity == null) {
            memoryEntity = new MemoryEntity();
            memoryEntity.setType(memoryType);
            memoryEntity = memoryRepository.save(memoryEntity);
        }

        ProductMemoryEntity productMemory = productMemoryRepository
                .findByProductIdAndMemoryId(product.getId(), memoryEntity.getId());
        if (productMemory == null) {
            productMemory = new ProductMemoryEntity();
            productMemory.setProduct(product);
            productMemory.setMemory(memoryEntity);
            productMemory.setPrice(unitCost == null ? BigDecimal.ZERO : unitCost);
            productMemoryRepository.save(productMemory);
        }
    }

    private void ensureProductColor(ProductEntity product, ColorEntity color) {
        if (color == null) {
            return;
        }

        List<ColorEntity> colors = product.getColors();
        if (colors == null) {
            return;
        }

        for (ColorEntity item : colors) {
            if (item.getId() != null && item.getId().equals(color.getId())) {
                return;
            }
        }

        colors.add(color);
        productRepository.save(product);
    }
}
