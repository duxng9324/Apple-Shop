package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.StockReceiptDTO;
import com.business.service.IStockReceiptService;

@CrossOrigin
@RestController
public class StockReceiptAPI {

    @Autowired
    private IStockReceiptService stockReceiptService;

    @PostMapping(value = "/api/stock-receipt")
    public ResponseEntity<?> create(@RequestBody StockReceiptDTO model) {
        return ResponseEntity.ok(stockReceiptService.createVoucher(model));
    }

    @GetMapping(value = "/api/stock-receipt")
    public List<StockReceiptDTO> getAll() {
        return stockReceiptService.findAll();
    }

    @GetMapping(value = "/api/stock-receipt/warehouse/{warehouseId}")
    public List<StockReceiptDTO> getByWarehouse(@PathVariable Long warehouseId) {
        return stockReceiptService.findByWarehouse(warehouseId);
    }
}
