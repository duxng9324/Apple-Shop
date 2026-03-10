package com.business.service;

import java.util.List;

import com.business.dto.ProductDTO;

public interface IProductService {
	ProductDTO save(ProductDTO productDTO);
	void delete(long id);
	List<ProductDTO> getAllProduct();
	List<ProductDTO> getProductByCategory(String categoryName);
	ProductDTO getProductByCode(String code);
}
