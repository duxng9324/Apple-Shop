package com.business.service;

import org.springframework.web.multipart.MultipartFile;

public interface IImageService {
	String uploadFile(MultipartFile file);
	byte[] downloadImage(String filename);
	String uploadFileByUser(MultipartFile file, Long userId);
	byte[] downloadImageByUser(Long userId);
}
