package com.business.converter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.CartDTO;
import com.business.entity.CartEntity;
import com.business.entity.CartItemEntity;
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

		if (productEntity != null) {
			CartItemEntity cartItemEntity = new CartItemEntity();
			cartItemEntity.setCart(entity);
			cartItemEntity.setProduct(productEntity);
			cartItemEntity.setQuantity(dto.getQuantity());
			entity.getCartItems().clear();
			entity.getCartItems().add(cartItemEntity);
		}
		return entity;
	}
	public CartDTO toDTO(CartEntity entity) {
		CartDTO dto = new CartDTO();
		dto.setId(entity.getId());
		dto.setQuantity(entity.getQuantity());
		dto.setColor(entity.getColor());
		dto.setMemory(entity.getMemory());
		dto.setUserDTO(userConverter.toDTO(entity.getUser()));
		if (entity.getCartItems() != null && !entity.getCartItems().isEmpty()) {
			ProductEntity productEntity = entity.getCartItems().get(0).getProduct();
			dto.setProductDTO(productConverter.toDTO(productEntity));
			dto.setProductId(productEntity.getId());
		} else if (entity.getProduct() != null) {
			// Fallback for legacy rows that may not have cart_item data yet.
			dto.setProductDTO(productConverter.toDTO(entity.getProduct()));
			dto.setProductId(entity.getProduct().getId());
		}
		dto.setUserId(entity.getUser().getId());
		return dto;
	}
	public CartEntity toEntity(CartDTO dto, CartEntity entity) {
		entity.setQuantity(dto.getQuantity());
		entity.setColor(dto.getColor());
		entity.setMemory(dto.getMemory());

		if (dto.getProductId() != null) {
			ProductEntity productEntity = productRepository.findById(dto.getProductId()).orElse(null);
			if (productEntity != null) {
				entity.setProduct(productEntity);
				if (entity.getCartItems() == null || entity.getCartItems().isEmpty()) {
					CartItemEntity cartItemEntity = new CartItemEntity();
					cartItemEntity.setCart(entity);
					cartItemEntity.setProduct(productEntity);
					cartItemEntity.setQuantity(dto.getQuantity());
					entity.getCartItems().add(cartItemEntity);
				} else {
					CartItemEntity cartItemEntity = entity.getCartItems().get(0);
					cartItemEntity.setProduct(productEntity);
					cartItemEntity.setQuantity(dto.getQuantity());
				}
			}
		}
		return entity;
	}
}
