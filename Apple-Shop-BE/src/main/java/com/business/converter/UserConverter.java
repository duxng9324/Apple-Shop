package com.business.converter;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.UserDTO;
import com.business.entity.ImageEntity;
import com.business.entity.UserEntity;
import com.business.repository.ImageRepository;
import com.business.util.ImageUtils;

@Component
public class UserConverter {
	
	@Autowired
	private ImageRepository imageRepository;
	
	public UserEntity toEntity(UserDTO dto) {
		UserEntity entity = new UserEntity();
		entity.setAddress(dto.getAddress());
		entity.setFullName(dto.getFullName());
		entity.setUsername(dto.getUserName());
		entity.setPassword(dto.getPassword());
		entity.setPhone(dto.getPhone());
		entity.setRole(0);
		entity.setEmail(dto.getEmail());
		return entity;
	}
	public UserDTO toDTO(UserEntity entity) {
		UserDTO dto = new UserDTO();
		dto.setId(entity.getId());
		dto.setAddress(entity.getAddress());
		dto.setFullName(entity.getFullName());
		dto.setUserName(entity.getUsername());
		dto.setPhone(entity.getPhone());
		dto.setRole(entity.getRole());
		dto.setEmail(entity.getEmail());
		Optional<ImageEntity> dbImageData = imageRepository.findByUser(entity);
		if (dbImageData.isPresent()) {
			ImageEntity imageEntity = dbImageData.get();
			if (imageEntity.getImageUrl() != null && !imageEntity.getImageUrl().trim().isEmpty()) {
				dto.setImages(imageEntity.getImageUrl());
			} else if (imageEntity.getImageData() != null) {
				byte[] images = ImageUtils.decompressImage(imageEntity.getImageData());
				dto.setImages(ImageUtils.convertBytesToDataUrl(images));
			}
		}
		return dto;
	}
	public UserEntity toEntity(UserDTO dto, UserEntity entity) {
		entity.setAddress(dto.getAddress());
		entity.setFullName(dto.getFullName());
		entity.setUsername(dto.getUserName());
		entity.setPhone(dto.getPhone());
		entity.setEmail(dto.getEmail());
		return entity;
	}
}
