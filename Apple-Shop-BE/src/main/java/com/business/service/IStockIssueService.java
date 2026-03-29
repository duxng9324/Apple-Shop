package com.business.service;

import java.util.List;

import com.business.dto.StockIssueDTO;

public interface IStockIssueService {
    StockIssueDTO createVoucher(StockIssueDTO stockIssueDTO);

    List<StockIssueDTO> findAll();

    List<StockIssueDTO> findByWarehouse(Long warehouseId);
}
