package com.business.converter;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.business.dto.CommentDTO;
import com.business.entity.CommentEntity;
import com.business.entity.UserEntity;
import com.business.repository.ProductRepository;
import com.business.repository.UserRepository;

@Component
public class CommentConverter {
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private ProductRepository productRepository;
	
	@Autowired
	private UserConverter userConverter;
	
	
	public Date getCurrentTime() {
	    return new Date();
	}
	
	public CommentEntity toEntity(CommentDTO dto) {
		CommentEntity entity = new CommentEntity();
		entity.setComment(dto.getComment());
		entity.setRating(dto.getRating());
		entity.setProduct(productRepository.findByName(dto.getProductName()));
			   entity.setUser(userRepository.findById(dto.getUserId()).orElse(null));
		entity.setTimeCmt(getCurrentTime());
		return entity;
	}
	
	public CommentDTO toDTO(CommentEntity entity) throws NullPointerException {
		CommentDTO dto = new CommentDTO();
		dto.setId(entity.getId());
		dto.setComment(entity.getComment());
		dto.setReply(entity.getReply());
		dto.setRating(entity.getRating());
		UserEntity user = entity.getUser();
		if(entity.getAdminId() != null) {
			   UserEntity admin = userRepository.findById(entity.getAdminId()).orElse(null);
			dto.setAdminName(admin.getUsername());
		}
		dto.setUserName(user.getUsername());
		dto.setUser(userConverter.toDTO(user));
		dto.setTimeCmt(entity.getTimeCmt());
		dto.setTimeRep(entity.getTimeRep());
		return dto;
	}
	
	public CommentEntity toEntityReply(CommentDTO dto, CommentEntity entity) {
		entity.setReply(dto.getReply());
		entity.setAdminId(dto.getAdminId());
		entity.setTimeRep(getCurrentTime());
		return entity;
	}
	
	public CommentEntity toEntity(CommentDTO dto, CommentEntity entity) {
		entity.setComment(dto.getComment());
		entity.setTimeCmt(getCurrentTime());
		return entity;
	}
}
