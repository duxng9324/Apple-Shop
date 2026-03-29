package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.StockIssueEntity;

@Repository
public interface StockIssueRepository extends JpaRepository<StockIssueEntity, Long> {

    List<StockIssueEntity> findByWarehouseId(Long warehouseId);

    List<StockIssueEntity> findByIssueDateBetween(Date fromDate, Date toDate);
}
