package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.business.entity.MemoryEntity;

public interface MemoryRepository extends JpaRepository<MemoryEntity, Long> {
	MemoryEntity findByType(String type);
}
