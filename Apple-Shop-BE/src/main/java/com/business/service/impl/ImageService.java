package com.business.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.business.entity.ImageEntity;
import com.business.entity.UserEntity;
import com.business.repository.ImageRepository;
import com.business.repository.UserRepository;
import com.business.service.IImageService;
import com.business.util.ImageUtils;

@Service
public class ImageService implements IImageService {
	
	@Autowired
	private ImageRepository imageRepository; 
	
	@Autowired
	private UserRepository userRepository;
	
	@Override
	public String uploadFile(MultipartFile file) {
		try {
			ImageEntity imageEntity = new ImageEntity();
			imageEntity.setName(file.getOriginalFilename());
			imageEntity.setType(file.getContentType());
			imageEntity.setImageData(ImageUtils.compressImage(file.getBytes()));
			imageEntity= imageRepository.save(imageEntity);
			return "file upload successfully: " +  file.getOriginalFilename();
		} catch (Exception ex) {
			ex.printStackTrace();
			return null;
		}
	}

	@Override
	public byte[] downloadImage(String filename) {
		Optional<ImageEntity> dbImageData = imageRepository.findByName(filename);
		byte[] images = ImageUtils.decompressImage(dbImageData.get().getImageData());
		return images;
	}

	@Override
	public String uploadFileByUser(MultipartFile file, Long userId) {
			   UserEntity userEntity = userRepository.findById(userId).orElse(null);
		Optional<ImageEntity> imageEntityex = imageRepository.findByUser(userEntity);
		if(imageEntityex.isPresent()) {
			ImageEntity imageEntity = imageEntityex.get();
			try {
				imageEntity.setName(file.getOriginalFilename());
				imageEntity.setType(file.getContentType());
				imageEntity.setImageData(ImageUtils.compressImage(file.getBytes()));
				imageEntity.setUser(userEntity);
				imageEntity= imageRepository.save(imageEntity);
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		} else {
			try {
				ImageEntity imageEntity = new ImageEntity();
				imageEntity.setName(file.getOriginalFilename());
				imageEntity.setType(file.getContentType());
				imageEntity.setImageData(ImageUtils.compressImage(file.getBytes()));
				imageEntity.setUser(userEntity);
				imageEntity= imageRepository.save(imageEntity);
			} catch(Exception ex) {
				ex.printStackTrace();
			}
		}
		
		
		return null;
	}

	@Override
	public byte[] downloadImageByUser(Long userId) {
			   UserEntity userEntity = userRepository.findById(userId).orElse(null);
		Optional<ImageEntity> dbImageData = imageRepository.findByUser(userEntity);
		byte[] images = ImageUtils.decompressImage(dbImageData.get().getImageData());
		return images;
	}
	
	
}
