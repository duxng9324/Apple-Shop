package com.business.api;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.business.service.impl.ImageService;

@CrossOrigin
@RestController
public class ImageAPI {
	
	@Autowired
	private ImageService imageService;
	
	@PostMapping(value = "/api/image")
	public ResponseEntity<?> uploadImage(@RequestParam("image")MultipartFile file) throws IOException {
		String uploadImage = imageService.uploadFile(file);
		return ResponseEntity.status(HttpStatus.OK).body(uploadImage);
	}

	@PostMapping(value = "/api/image/product")
	public ResponseEntity<List<String>> uploadProductImages(@RequestParam("images") MultipartFile[] files) {
		List<String> urls = imageService.uploadProductFiles(files);
		return ResponseEntity.status(HttpStatus.OK).body(urls);
	}
	
	@GetMapping(value = "/api/image/{fileName:.+}")
	public ResponseEntity<?> downloadImage(@PathVariable String fileName) {
		byte[] imageData = imageService.downloadImage(fileName);
		if (imageData == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ảnh");
		}
		return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png")).body(imageData);
	}
	
	@PostMapping(value = "/api/image/user/{userId}")
	public ResponseEntity<?> uploadImageByUser(@RequestParam("image")MultipartFile file, @PathVariable Long userId) throws IOException {
		String uploadImage = imageService.uploadFileByUser(file, userId);
		return ResponseEntity.status(HttpStatus.OK).body(uploadImage);
	}
	
	@GetMapping(value = "/api/image/user/{userId}")
	public ResponseEntity<?> downloadImageByUser(@PathVariable Long userId) {
		String imageUrl = imageService.downloadImageByUser(userId);
		if (imageUrl == null || imageUrl.trim().isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy ảnh");
		}
		return ResponseEntity.status(HttpStatus.OK).body(imageUrl);
	}
}
