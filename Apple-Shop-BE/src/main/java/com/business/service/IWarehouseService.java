package com.business.service;

import java.util.List;

import com.business.dto.WarehouseDTO;

public interface IWarehouseService {
    WarehouseDTO save(WarehouseDTO warehouseDTO);

    WarehouseDTO update(Long id, WarehouseDTO warehouseDTO);

    List<WarehouseDTO> findAll();

    WarehouseDTO findById(Long id);

    void delete(Long id);
}
