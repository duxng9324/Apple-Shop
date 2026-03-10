package com.business.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.CommentConverter;
import com.business.dto.CommentDTO;
import com.business.entity.CommentEntity;
import com.business.repository.CommentRepository;
import com.business.service.ICommentService;

@Service
public class CommentService implements ICommentService {
	
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private CommentConverter commentConverter;

	@Override
	public CommentDTO save(CommentDTO commentDTO) {
		CommentEntity commentEntity = commentConverter.toEntity(commentDTO);
		commentRepository.save(commentEntity);
		CommentDTO commentDTO2 = new CommentDTO();
		try {
			commentDTO2 = commentConverter.toDTO(commentEntity);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return commentDTO2;
	}

	@Override
	public CommentDTO saveReply(CommentDTO commentDTO, Long id) {
			   CommentEntity entityEx = commentRepository.findById(id).orElse(null);
		entityEx = commentConverter.toEntityReply(commentDTO, entityEx);
		return commentConverter.toDTO(commentRepository.save(entityEx));
	}

	@Override
	public CommentDTO changeComment(CommentDTO commentDTO, Long id) {
			   CommentEntity entityEx = commentRepository.findById(id).orElse(null);
		entityEx = commentConverter.toEntity(commentDTO, entityEx);
		return commentConverter.toDTO(commentRepository.save(entityEx));
	}

	@Override
	public CommentDTO changeReply(CommentDTO commentDTO, Long id) {
			   CommentEntity entityEx = commentRepository.findById(id).orElse(null);
		entityEx = commentConverter.toEntityReply(commentDTO, entityEx);
		return commentConverter.toDTO(commentRepository.save(entityEx));
	}

	@Override
	public void delete(Long id) {
			   commentRepository.deleteById(id);
	}

	@Override
	public void deleteReply(Long id) {
			   CommentEntity entityEx = commentRepository.findById(id).orElse(null);
		entityEx.setReply(null);
		commentRepository.save(entityEx);
	}

}
