package com.business.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.business.entity.ImageEntity;
import com.business.entity.UserEntity;
import com.business.exception.BadRequestException;
import com.business.exception.InternalServerException;
import com.business.exception.NotFoundException;
import com.business.repository.ImageRepository;
import com.business.repository.UserRepository;
import com.business.service.IImageService;
import com.business.util.ImageUtils;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ImageService implements IImageService {
	
	@Autowired
	private ImageRepository imageRepository; 
	
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private Cloudinary cloudinary;

	@Value("${cloudinary.folder:apple-shop}")
	private String cloudinaryFolder;

	private Map<?, ?> uploadToCloud(MultipartFile file) throws IOException {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("File ảnh trống");
		}
		return cloudinary.uploader().upload(file.getBytes(),
				ObjectUtils.asMap("folder", cloudinaryFolder, "resource_type", "image"));
	}

	private void safeDeleteFromCloud(String publicId) {
		if (publicId == null || publicId.trim().isEmpty()) {
			return;
		}
		try {
			cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
		} catch (Exception ignored) {
		}
	}
	
	@Override
	public String uploadFile(MultipartFile file) {
		try {
			Map<?, ?> uploadResult = uploadToCloud(file);
			ImageEntity imageEntity = new ImageEntity();
			imageEntity.setName(file.getOriginalFilename());
			imageEntity.setType(file.getContentType());
			imageEntity.setImageUrl((String) uploadResult.get("secure_url"));
			imageEntity.setCloudPublicId((String) uploadResult.get("public_id"));
			imageEntity.setImageData(null);
			imageEntity= imageRepository.save(imageEntity);
			return imageEntity.getImageUrl();
		} catch (Exception ex) {
			throw new InternalServerException("Upload ảnh lên cloud thất bại", ex);
		}
	}

	@Override
	public List<String> uploadProductFiles(MultipartFile[] files) {
		if (files == null || files.length == 0) {
			throw new BadRequestException("Danh sách ảnh sản phẩm trống");
		}
		List<String> urls = new ArrayList<>();
		for (MultipartFile file : files) {
			try {
				Map<?, ?> uploadResult = uploadToCloud(file);
				String url = (String) uploadResult.get("secure_url");
				if (url != null && !url.trim().isEmpty()) {
					urls.add(url);
				}
			} catch (Exception ex) {
				throw new InternalServerException("Upload ảnh sản phẩm thất bại", ex);
			}
		}
		if (urls.isEmpty()) {
			throw new InternalServerException("Upload ảnh sản phẩm thất bại");
		}
		return urls;
	}

	@Override
	public byte[] downloadImage(String filename) {
		Optional<ImageEntity> dbImageData = imageRepository.findByName(filename);
		if (!dbImageData.isPresent() || dbImageData.get().getImageData() == null) {
			return null;
		}
		byte[] images = ImageUtils.decompressImage(dbImageData.get().getImageData());
		return images;
	}

	@Override
	public String uploadFileByUser(MultipartFile file, Long userId) {
		UserEntity userEntity = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("Không tìm thấy user"));
		Optional<ImageEntity> imageEntityex = imageRepository.findByUser(userEntity);
		try {
			Map<?, ?> uploadResult = uploadToCloud(file);
			ImageEntity imageEntity = imageEntityex.orElse(new ImageEntity());
			safeDeleteFromCloud(imageEntity.getCloudPublicId());

			imageEntity.setName(file.getOriginalFilename());
			imageEntity.setType(file.getContentType());
			imageEntity.setImageUrl((String) uploadResult.get("secure_url"));
			imageEntity.setCloudPublicId((String) uploadResult.get("public_id"));
			imageEntity.setImageData(null);
			imageEntity.setUser(userEntity);
			imageEntity = imageRepository.save(imageEntity);
			return imageEntity.getImageUrl();
		} catch (Exception ex) {
			throw new InternalServerException("Upload ảnh đại diện thất bại", ex);
		}
	}

	@Override
	public String downloadImageByUser(Long userId) {
		UserEntity userEntity = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("Không tìm thấy user"));
		Optional<ImageEntity> dbImageData = imageRepository.findByUser(userEntity);
		if (!dbImageData.isPresent()) {
			return null;
		}
		ImageEntity imageEntity = dbImageData.get();
		if (imageEntity.getImageUrl() != null && !imageEntity.getImageUrl().trim().isEmpty()) {
			return imageEntity.getImageUrl();
		}
		if (imageEntity.getImageData() != null) {
			byte[] images = ImageUtils.decompressImage(imageEntity.getImageData());
			return ImageUtils.convertBytesToDataUrl(images);
		}
		return null;
	}
	
	
}
