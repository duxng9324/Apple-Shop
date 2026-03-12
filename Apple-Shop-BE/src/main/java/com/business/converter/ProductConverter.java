package com.business.converter;



import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.ColorDTO;
import com.business.dto.CommentDTO;
import com.business.dto.ProductDTO;
import com.business.dto.TypeDTO;
import com.business.entity.ColorEntity;
import com.business.entity.CommentEntity;
import com.business.entity.ProductEntity;
import com.business.entity.ProductImageEntity;
import com.business.entity.ProductMemoryEntity;

@Component
public class ProductConverter {
	
	@Autowired
	private ColorConverter colorConverter;
	
	@Autowired
	private CategoryConverter categoryConverter;
	
	@Autowired
	private CommentConverter commentConverter;
	
	public ProductEntity toEntity(ProductDTO dto) {
		ProductEntity entity = new ProductEntity();
		entity.setName(dto.getName());
		entity.setDescription(dto.getDescription());
		entity.setCode(dto.getCode());
		// Map imgLinks (List<String>) to images (List<ProductImageEntity>)
		if (dto.getImgLinks() != null) {
			List<ProductImageEntity> images = new ArrayList<>();
			for (String link : dto.getImgLinks()) {
				ProductImageEntity image = new ProductImageEntity();
				image.setImageLink(link);
				image.setProduct(entity);
				images.add(image);
			}
			entity.setImages(images);
		}
		return entity;
	}
	public ProductDTO toDTO(ProductEntity entity) {
		ProductDTO dto = new ProductDTO();
		if(entity.getId() != null) {
			dto.setId(entity.getId());
		}
		dto.setName(entity.getName());
		dto.setDescription(entity.getDescription());
		dto.setCode(entity.getCode());
		// Map images (List<ProductImageEntity>) to imgLinks (List<String>)
		if (entity.getImages() != null) {
			List<String> imgLinks = new ArrayList<>();
			for (ProductImageEntity image : entity.getImages()) {
				imgLinks.add(image.getImageLink());
			}
			dto.setImgLinks(imgLinks);
		}
		dto.setCategoryCode(entity.getCategory().getCode());
		dto.setCategoryDTO(categoryConverter.toDTO(entity.getCategory()));
		
		List<ColorEntity> colorEntities = entity.getColors();
		List<ColorDTO> colorDTOs = new ArrayList<>();
		for(ColorEntity colorEntity : colorEntities) {
			ColorDTO colorDTO = colorConverter.toDTO(colorEntity);
			colorDTOs.add(colorDTO);
		}
		dto.setColorDTOs(colorDTOs);
		
		List<ProductMemoryEntity> productMemoryEntities = entity.getMemories();
		List<TypeDTO> typeDTOs = new ArrayList<>();
		
		for(ProductMemoryEntity productMemoryEntity : productMemoryEntities) {
			TypeDTO typeDTO = new TypeDTO();
			typeDTO.setPrice(productMemoryEntity.getPrice());
			typeDTO.setType(productMemoryEntity.getMemory().getType());
			typeDTOs.add(typeDTO);
		}
		dto.setList(typeDTOs);
		
		List<CommentEntity> commentEntities = entity.getComments(); 
		List<CommentDTO> commentDTOs = new ArrayList<>();
		for(CommentEntity commentEntity: commentEntities) {
			CommentDTO commentDTO = commentConverter.toDTO(commentEntity);
			commentDTOs.add(commentDTO);
		}
		dto.setCommentDTOs(commentDTOs);
		return dto;
	}
	public ProductEntity toEntity(ProductDTO dto, ProductEntity entity) {
		entity.setName(dto.getName());
		entity.setDescription(dto.getDescription());
		entity.setCode(dto.getCode());
		// Update images
		if (dto.getImgLinks() != null) {
			List<ProductImageEntity> images = new ArrayList<>();
			for (String link : dto.getImgLinks()) {
				ProductImageEntity image = new ProductImageEntity();
				image.setImageLink(link);
				image.setProduct(entity);
				images.add(image);
			}
			entity.setImages(images);
		}
		return entity;
	}
}
