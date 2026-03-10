package com.business.service;

import java.util.List;

import com.business.dto.OrderDTO;

public interface IOrderService {
	OrderDTO save(OrderDTO orderDTO);
	List<OrderDTO> getOrderByUserId(Long userId);
	OrderDTO updateStatusOrder(Long id, String status);
	List<OrderDTO> getAllOrder();
	String changeCheck(Long id);
}
