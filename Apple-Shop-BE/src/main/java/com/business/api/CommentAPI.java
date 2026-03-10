package com.business.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.CommentDTO;
import com.business.service.impl.CommentService;

@RestController
@CrossOrigin
public class CommentAPI {
	@Autowired
	private CommentService commentService;
	
	@PostMapping(value = "/api/comment")
	public ResponseEntity<CommentDTO> addComment(@RequestBody CommentDTO model) {
		try {
			CommentDTO commentDTO = commentService.save(model);
			return ResponseEntity.ok(commentDTO);
			
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	@PostMapping(value = "api/reply/{id}")
	public ResponseEntity<CommentDTO> addReply(@RequestBody CommentDTO model, @PathVariable Long id) {
		try {
			CommentDTO commentDTO = commentService.saveReply(model,id);
			return ResponseEntity.ok(commentDTO);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	@PutMapping(value = "api/comment/{id}")
	public ResponseEntity<CommentDTO> changeComment(@RequestBody CommentDTO model, @PathVariable Long id) {
		try {
			CommentDTO commentDTO = commentService.changeComment(model, id);
			return ResponseEntity.ok(commentDTO);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	@PutMapping(value = "api/reply/{id}")
	public ResponseEntity<CommentDTO> changeReply(@RequestBody CommentDTO model, @PathVariable Long id) {
		try {
			CommentDTO commentDTO = commentService.changeReply(model, id);
			return ResponseEntity.ok(commentDTO);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	@DeleteMapping(value = "/api/comment/{id}")
	public void deleteComment( @PathVariable("id") Long id) {
		commentService.delete(id);
	}
	
	@DeleteMapping(value = "/api/reply/{id}")
	public void deleteReply( @PathVariable("id") Long id) {
		commentService.deleteReply(id);
	}	
}
