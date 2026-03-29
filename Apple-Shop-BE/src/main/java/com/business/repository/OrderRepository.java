package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.OrderEntity;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long>  {
	List<OrderEntity> findByUserId(Long id);
	List<OrderEntity> findByOrderTimeBetween(Date fromDate, Date toDate);
}
