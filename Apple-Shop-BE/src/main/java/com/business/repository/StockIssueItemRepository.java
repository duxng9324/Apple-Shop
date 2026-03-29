package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.StockIssueItemEntity;

@Repository
public interface StockIssueItemRepository extends JpaRepository<StockIssueItemEntity, Long> {
}
