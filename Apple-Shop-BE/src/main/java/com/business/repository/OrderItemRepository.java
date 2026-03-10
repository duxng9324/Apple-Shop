package com.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.business.entity.OrderItemEntity;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
	List<OrderItemEntity> findByOrderId(Long id);
}
