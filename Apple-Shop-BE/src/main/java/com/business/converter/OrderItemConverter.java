package com.business.converter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.OrderItemDTO;
import com.business.entity.OrderEntity;
import com.business.entity.OrderItemEntity;
import com.business.repository.OrderRepository;

@Component
public class OrderItemConverter {
	
	@Autowired
	private OrderRepository orderRepository;
	
	public OrderItemEntity toEntity(OrderItemDTO dto) {
		OrderItemEntity entity = new OrderItemEntity();
		entity.setImage(dto.getImage());
		entity.setName(dto.getName());
		entity.setProductIdRef(dto.getProductId());
		entity.setProductCode(dto.getProductCode());
		entity.setQuantity(dto.getQuantity());
		entity.setPrice(dto.getPrice());
		entity.setMemory(dto.getMemory());
		entity.setColor(dto.getColor());
			   OrderEntity orderEntity = orderRepository.findById(dto.getOrderId()).orElse(null);
		entity.setOrder(orderEntity);
		return entity;
	}
	public OrderItemDTO toDTO(OrderItemEntity entity) {
		OrderItemDTO dto = new OrderItemDTO();
		dto.setId(entity.getId());
		dto.setImage(entity.getImage());
		dto.setName(entity.getName());
		dto.setProductId(entity.getProductIdRef());
		dto.setProductCode(entity.getProductCode());
		dto.setQuantity(entity.getQuantity());
		dto.setPrice(entity.getPrice());
		dto.setMemory(entity.getMemory());
		dto.setColor(entity.getColor());
		return dto;
	}
}
