package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.OrderConverter;
import com.business.converter.OrderItemConverter;
import com.business.dto.OrderDTO;
import com.business.dto.OrderItemDTO;
import com.business.entity.OrderEntity;
import com.business.entity.OrderItemEntity;
import com.business.repository.OrderItemRepository;
import com.business.repository.OrderRepository;
import com.business.service.IOrderService;

@Service
public class OrderService implements IOrderService {
	
	@Autowired
	private OrderConverter orderConverter;
	
	@Autowired
	private OrderItemConverter orderItemConverter;
	
	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private OrderItemRepository orderItemRepository;

	@Override
	public OrderDTO save(OrderDTO orderDTO) {
		OrderEntity orderEntity = new OrderEntity();
		orderEntity = orderRepository.save(orderConverter.toEntity(orderDTO));
		Long orderId = orderEntity.getId();
		List<OrderItemDTO> orderItemDTOs = new ArrayList<>();
		orderItemDTOs = orderDTO.getOrderItemDTOs();
		for(OrderItemDTO orderItemDTO : orderItemDTOs) {
			orderItemDTO.setOrderId(orderId);
			OrderItemEntity orderItemEntity = new OrderItemEntity();
			orderItemEntity = orderItemConverter.toEntity(orderItemDTO);
			orderItemEntity = orderItemRepository.save(orderItemEntity);
		}
		return orderConverter.toDTO(orderEntity);
	}

	@Override
	public List<OrderDTO> getOrderByUserId(Long userId) {
		List<OrderEntity> orderEntities = orderRepository.findByUserId(userId);
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for(OrderEntity orderEntity : orderEntities) {
			OrderDTO orderDTO = orderConverter.toDTO(orderEntity);
			orderDTOs.add(orderDTO);
		}
		return orderDTOs;
	}

	@Override
	public OrderDTO updateStatusOrder(Long id, String status) {
			   OrderEntity orderEntity = orderRepository.findById(id).orElse(null);
		orderEntity.setStatus(status);
		orderEntity = orderRepository.save(orderEntity);
		return orderConverter.toDTO(orderEntity);
	}

	@Override
	public List<OrderDTO> getAllOrder() {
		List<OrderEntity> orderEntities = orderRepository.findAll();
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for(OrderEntity orderEntity : orderEntities) {
			OrderDTO orderDTO = orderConverter.toDTO(orderEntity);
			orderDTOs.add(orderDTO);
		}
		return orderDTOs;
	}

	@Override
	public String changeCheck(Long id) {
			   OrderEntity orderEntity = orderRepository.findById(id).orElse(null);
		orderEntity.setCheckCmt(1);
		orderEntity = orderRepository.save(orderEntity);
		return "ok";
	}
	
}
