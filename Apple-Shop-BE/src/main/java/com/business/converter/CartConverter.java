package com.business.converter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.CartDTO;
import com.business.entity.CartEntity;
import com.business.entity.ProductEntity;
import com.business.entity.UserEntity;
import com.business.repository.ProductRepository;
import com.business.repository.UserRepository;


@Component
public class CartConverter {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private UserConverter userConverter;
	
	@Autowired
	private ProductRepository productRepository;
	
	@Autowired ProductConverter productConverter;
	
	public CartEntity toEntity(CartDTO dto) {
		CartEntity entity = new CartEntity();
		entity.setQuantity(dto.getQuantity());
		entity.setColor(dto.getColor());
		entity.setMemory(dto.getMemory());
			   UserEntity userEntity = userRepository.findById(dto.getUserId()).orElse(null);
			   ProductEntity productEntity = productRepository.findById(dto.getProductId()).orElse(null);
		entity.setUser(userEntity);
		entity.setProduct(productEntity);
		return entity;
	}
	public CartDTO toDTO(CartEntity entity) {
		CartDTO dto = new CartDTO();
		dto.setId(entity.getId());
		dto.setQuantity(entity.getQuantity());
		dto.setColor(entity.getColor());
		dto.setMemory(entity.getMemory());
		dto.setUserDTO(userConverter.toDTO(entity.getUser()));
		dto.setProductDTO(productConverter.toDTO(entity.getProduct()));
		return dto;
	}
	public CartEntity toEntity(CartDTO dto, CartEntity entity) {
		entity.setQuantity(dto.getQuantity());
		entity.setColor(dto.getColor());
		entity.setMemory(dto.getMemory());
		return entity;
	}
}
