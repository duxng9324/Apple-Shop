package com.business.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.converter.ProductConverter;
import com.business.dto.ProductDTO;
import com.business.dto.TypeDTO;
import com.business.dto.VariantStockDTO;
import com.business.entity.CategoryEntity;
import com.business.entity.ColorEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.MemoryEntity;
import com.business.entity.ProductEntity;
import com.business.entity.ProductMemoryEntity;
import com.business.repository.CategoryRepository;
import com.business.repository.ColorRepository;
import com.business.repository.InventoryRepository;
import com.business.repository.MemoryRepository;
import com.business.repository.ProductMemoryRepository;
import com.business.repository.ProductRepository;
import com.business.service.IProductService;

@Service
public class ProductService implements IProductService {
	@Autowired
	private ProductRepository productRepository;
	
	@Autowired
	private ProductConverter productConverter;
	
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
	
	@Override
	@Transactional
	public ProductDTO save(ProductDTO productDTO) {
		if (productDTO.getCode() == null || productDTO.getCode().trim().isEmpty()) {
			throw new RuntimeException("Mã sản phẩm là bắt buộc");
		}

		ProductEntity productEntity;
		if(productDTO.getId() != null) {
			   ProductEntity existingProduct = productRepository.findById(productDTO.getId()).orElse(null);
			productEntity = productConverter.toEntity(productDTO,existingProduct);
		} else {
			productEntity = productConverter.toEntity(productDTO);
		}
		
		//Category
		CategoryEntity categoryEntity = categoryRepository.findByCode(productDTO.getCategoryCode());
		if (categoryEntity == null) {
			throw new RuntimeException("categoryCode không tồn tại: " + productDTO.getCategoryCode());
		}
		productEntity.setCategory(categoryEntity);
		
		// Color
		List<Long> colors = productDTO.getColors();
		if (colors == null) {
			colors = new ArrayList<>();
		}
		List<ColorEntity> colorEntities= new ArrayList<>();
		for (int i = 0; i < colors.size(); i++) {
			Long id = colors.get(i);
			ColorEntity colorEntity = colorRepository.findById(id).orElse(null);
			colorEntities.add(colorEntity);
		}
		productEntity.setColors(colorEntities);
		
		
		//typeDTO
		List<TypeDTO> list = productDTO.getList();
		if (list == null) {
			list = new ArrayList<>();
		}
		if (list.isEmpty()) {
			throw new RuntimeException("Vui lòng chọn ít nhất 1 bộ nhớ có tồn kho trước khi thêm/sửa sản phẩm");
		}

		String normalizedCode = productDTO.getCode().trim();
		validateInventoryForProductMemories(normalizedCode, list);

		productRepository.save(productEntity);
		if (productDTO.getId() != null) {
			productMemoryRepository.delete(productDTO.getId());
		} 
		for (TypeDTO item : list) {
			String type = normalizeMemoryType(item.getType());
			MemoryEntity memoryEntity = memoryRepository.findByType(type);
			if (memoryEntity == null) {
				throw new RuntimeException("Bộ nhớ không tồn tại: " + type);
			}
			ProductMemoryEntity productMemoryEntity = new ProductMemoryEntity();
			productMemoryEntity.setMemory(memoryEntity);
			productMemoryEntity.setPrice(item.getPrice());
			productMemoryEntity.setProduct(productEntity);
			productMemoryRepository.save(productMemoryEntity);
		}
		
		return productConverter.toDTO(productEntity);
	}

	@Override
	public void delete(long id) {
		if (inventoryRepository.existsByProductIdAndQuantityGreaterThan(id, 0)) {
			throw new RuntimeException("Không thể xóa sản phẩm vì vẫn còn tồn kho. Hãy xuất kho hết trước khi xóa.");
		}
			   productRepository.deleteById(id);
	}

	@Override
	public List<ProductDTO> getAllProduct() {
		List<ProductEntity> productEntities = productRepository.findAll();
		List<ProductDTO> productDTOs = new ArrayList<>();
		for(ProductEntity productEntity : productEntities) {
			ProductDTO productDTO = productConverter.toDTO(productEntity);
			productDTOs.add(productDTO);
		}
		return productDTOs;
	}

	@Override
	public List<ProductDTO> getProductByCategory(String categoryName) {
		List<ProductEntity> productEntities = productRepository.findByCategoryName(categoryName);
		List<ProductDTO> productDTOs = new ArrayList<>();
		for(ProductEntity productEntity : productEntities) {
			ProductDTO productDTO = productConverter.toDTO(productEntity);
			productDTOs.add(productDTO);
		}
		return productDTOs;
	}

	@Override
	public ProductDTO getProductByCode(String code) {
		ProductEntity productEntity = productRepository.findByCode(code);
		if (productEntity == null) {
			throw new RuntimeException("Product not found: " + code);
		}

			ProductDTO productDTO = productConverter.toDTO(productEntity);
			productDTO.setVariantStocks(buildVariantStocks(productEntity.getId()));
		return productDTO;
	}

	private List<VariantStockDTO> buildVariantStocks(Long productId) {
		List<InventoryEntity> inventoryEntities = inventoryRepository.findByProductId(productId);
		List<VariantStockDTO> stocks = new ArrayList<>();

		for (InventoryEntity entity : inventoryEntities) {
			VariantStockDTO stock = new VariantStockDTO();
			stock.setMemoryType(entity.getMemoryType());
			if (entity.getColor() != null) {
				stock.setColorId(entity.getColor().getId());
				stock.setColorName(entity.getColor().getColor());
			}
			stock.setQuantity(entity.getQuantity() == null ? 0 : entity.getQuantity());
			stocks.add(stock);
		}

		return stocks;
	}

	private void validateInventoryForProductMemories(String productCode, List<TypeDTO> list) {
		Set<String> uniqueMemoryTypes = new LinkedHashSet<>();
		for (TypeDTO item : list) {
			String memoryType = normalizeMemoryType(item == null ? null : item.getType());
			if (!uniqueMemoryTypes.add(memoryType)) {
				continue;
			}

			boolean hasInventory = inventoryRepository
					.existsByProductCodeAndMemoryTypeAndQuantityGreaterThan(productCode, memoryType, 0);
			if (!hasInventory) {
				throw new RuntimeException("Chưa có tồn kho cho mã " + productCode + " với bộ nhớ " + memoryType
						+ ". Vui lòng nhập kho trước rồi mới thêm/sửa ở tab sản phẩm.");
			}
		}
	}

	private String normalizeMemoryType(String memoryType) {
		if (memoryType == null || memoryType.trim().isEmpty()) {
			throw new RuntimeException("Bộ nhớ là bắt buộc");
		}
		return memoryType.trim().toUpperCase();
	}
}
