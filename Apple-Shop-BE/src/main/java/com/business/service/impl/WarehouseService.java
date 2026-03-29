package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.dto.WarehouseDTO;
import com.business.entity.WarehouseEntity;
import com.business.repository.WarehouseRepository;
import com.business.service.IWarehouseService;

@Service
public class WarehouseService implements IWarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Override
    public WarehouseDTO save(WarehouseDTO warehouseDTO) {
        WarehouseEntity entity = new WarehouseEntity();
        entity.setCode(warehouseDTO.getCode());
        entity.setName(warehouseDTO.getName());
        entity.setAddress(warehouseDTO.getAddress());
        entity.setActive(warehouseDTO.getActive() == null ? Boolean.TRUE : warehouseDTO.getActive());
        return toDTO(warehouseRepository.save(entity));
    }

    @Override
    public WarehouseDTO update(Long id, WarehouseDTO warehouseDTO) {
        WarehouseEntity entity = warehouseRepository.findById(id).orElse(null);
        if (entity == null) {
            throw new RuntimeException("Warehouse not found");
        }

        if (warehouseDTO.getCode() != null) {
            entity.setCode(warehouseDTO.getCode());
        }
        if (warehouseDTO.getName() != null) {
            entity.setName(warehouseDTO.getName());
        }
        if (warehouseDTO.getAddress() != null) {
            entity.setAddress(warehouseDTO.getAddress());
        }
        if (warehouseDTO.getActive() != null) {
            entity.setActive(warehouseDTO.getActive());
        }

        return toDTO(warehouseRepository.save(entity));
    }

    @Override
    public List<WarehouseDTO> findAll() {
        List<WarehouseEntity> entities = warehouseRepository.findAll();
        List<WarehouseDTO> dtos = new ArrayList<>();
        for (WarehouseEntity entity : entities) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    @Override
    public WarehouseDTO findById(Long id) {
        WarehouseEntity entity = warehouseRepository.findById(id).orElse(null);
        if (entity == null) {
            throw new RuntimeException("Warehouse not found");
        }
        return toDTO(entity);
    }

    @Override
    public void delete(Long id) {
        warehouseRepository.deleteById(id);
    }

    private WarehouseDTO toDTO(WarehouseEntity entity) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setAddress(entity.getAddress());
        dto.setActive(entity.getActive());
        return dto;
    }
}
