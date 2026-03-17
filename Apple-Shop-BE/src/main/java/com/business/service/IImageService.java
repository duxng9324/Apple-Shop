package com.business.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface IImageService {
	String uploadFile(MultipartFile file);
	List<String> uploadProductFiles(MultipartFile[] files);
	byte[] downloadImage(String filename);
	String uploadFileByUser(MultipartFile file, Long userId);
	String downloadImageByUser(Long userId);
}
