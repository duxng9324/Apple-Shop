package com.business.service;

import com.business.dto.CommentDTO;

public interface ICommentService {
	CommentDTO save(CommentDTO commentDTO);
	CommentDTO saveReply(CommentDTO commentDTO, Long id);
	CommentDTO changeComment(CommentDTO commentDTO, Long id);
	CommentDTO changeReply(CommentDTO commentDTO, Long id);
	void delete(Long id);
	void deleteReply(Long id);
}
