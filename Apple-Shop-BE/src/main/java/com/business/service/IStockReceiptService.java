package com.business.service;

import java.util.List;

import com.business.dto.StockReceiptDTO;

public interface IStockReceiptService {
    StockReceiptDTO createVoucher(StockReceiptDTO stockReceiptDTO);

    List<StockReceiptDTO> findAll();

    List<StockReceiptDTO> findByWarehouse(Long warehouseId);
}
