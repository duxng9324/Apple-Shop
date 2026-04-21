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

import com.business.dto.StockIssueDTO;
import com.business.service.IStockIssueService;

@CrossOrigin
@RestController
public class StockIssueAPI {

    @Autowired
    private IStockIssueService stockIssueService;

    @PostMapping(value = "/api/stock-issue")
    public ResponseEntity<StockIssueDTO> create(@RequestBody StockIssueDTO model) {
        return ResponseEntity.ok(stockIssueService.createVoucher(model));
    }

    @GetMapping(value = "/api/stock-issue")
    public List<StockIssueDTO> getAll() {
        return stockIssueService.findAll();
    }

    @GetMapping(value = "/api/stock-issue/warehouse/{warehouseId}")
    public List<StockIssueDTO> getByWarehouse(@PathVariable Long warehouseId) {
        return stockIssueService.findByWarehouse(warehouseId);
    }
}
