package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.WarehouseDTO;
import com.business.service.IWarehouseService;

@CrossOrigin
@RestController
public class WarehouseAPI {

    @Autowired
    private IWarehouseService warehouseService;

    @PostMapping(value = "/api/warehouse")
    public ResponseEntity<WarehouseDTO> create(@RequestBody WarehouseDTO model) {
        try {
            return ResponseEntity.ok(warehouseService.save(model));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping(value = "/api/warehouse/{id}")
    public ResponseEntity<WarehouseDTO> update(@PathVariable Long id, @RequestBody WarehouseDTO model) {
        try {
            return ResponseEntity.ok(warehouseService.update(id, model));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping(value = "/api/warehouse")
    public List<WarehouseDTO> getAll() {
        return warehouseService.findAll();
    }

    @GetMapping(value = "/api/warehouse/{id}")
    public WarehouseDTO getById(@PathVariable Long id) {
        return warehouseService.findById(id);
    }

    @DeleteMapping(value = "/api/warehouse/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            warehouseService.delete(id);
            return ResponseEntity.ok("Deleted");
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete failed");
        }
    }
}
