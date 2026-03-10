package com.business.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.business.entity.ImageEntity;
import com.business.entity.UserEntity;

public interface ImageRepository extends JpaRepository<ImageEntity, Long> {
	Optional<ImageEntity> findByName(String name);
	Optional<ImageEntity> findByNameAndUser(String name, UserEntity user);
	Optional<ImageEntity> findByUser(UserEntity user);
}
