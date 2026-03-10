package com.business.service;

import java.util.List;

import com.business.dto.MemoryDTO;

public interface IMemoryService {
	MemoryDTO save(MemoryDTO memoryDTO);
	void delete(long id);
	List<MemoryDTO> getAllMemory();
}
