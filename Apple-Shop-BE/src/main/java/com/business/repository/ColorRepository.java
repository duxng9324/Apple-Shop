package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.business.entity.ColorEntity;

public interface ColorRepository extends JpaRepository<ColorEntity, Long> {
	ColorEntity findByColorIgnoreCase(String color);

	ColorEntity findByCodeIgnoreCase(String code);

}
