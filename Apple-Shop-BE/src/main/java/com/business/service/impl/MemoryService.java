package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.MemoryConverter;
import com.business.dto.MemoryDTO;
import com.business.entity.MemoryEntity;
import com.business.repository.MemoryRepository;
import com.business.service.IMemoryService;

@Service
public class MemoryService implements IMemoryService {

	@Autowired
	private MemoryRepository memoryRepository;
	
	@Autowired
	private MemoryConverter memoryConverter;
	
	@Override
	public MemoryDTO save(MemoryDTO memoryDTO) {
		MemoryEntity memoryEntity = new MemoryEntity();
		if(memoryDTO.getId() != null) {
			   MemoryEntity existingMemory = memoryRepository.findById(memoryDTO.getId()).orElse(null);
			memoryEntity = memoryConverter.toEntity(memoryDTO,existingMemory);
		} else {
			memoryEntity = memoryConverter.toEntity(memoryDTO);
		}
		memoryRepository.save(memoryEntity);
		return memoryConverter.toDTO(memoryEntity);
	}

	@Override
	public void delete(long id) {
		
			   memoryRepository.deleteById(id);
		
	}

	@Override
	public List<MemoryDTO> getAllMemory() {
		List<MemoryEntity> memoriesEntity = memoryRepository.findAll();
		List<MemoryDTO> memoriesDTO = new ArrayList<>();
		for(MemoryEntity memoryEntity : memoriesEntity) {
			MemoryDTO memoryDTO = memoryConverter.toDTO(memoryEntity);
			memoriesDTO.add(memoryDTO);
		}
		return memoriesDTO;
	}
	
}
