package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.MemoryDTO;
import com.business.service.impl.MemoryService;

@CrossOrigin
@RestController
public class MemoryAPI {
	
	@Autowired
	private MemoryService memoryService;
	
	@PostMapping(value = "/api/memory")
    public ResponseEntity<MemoryDTO> addMemory(@RequestBody MemoryDTO model) {
		try {
			MemoryDTO memoryDTO = memoryService.save(model);
			return ResponseEntity.ok(memoryDTO);
			
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
    }
	@PutMapping(value = "/api/memory/{id}")
	public ResponseEntity<MemoryDTO> updateMemory(@RequestBody MemoryDTO model, @PathVariable("id") long id) {
		try {	
			model.setId(id);
			return ResponseEntity.ok(memoryService.save(model));
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	@DeleteMapping(value = "/api/memory/{id}")
	public void deleteMemory(@PathVariable("id") long id) {
		memoryService.delete(id);
	}
	@GetMapping(value = "/api/memory")
	public List<MemoryDTO> getAllMemory() {
		return memoryService.getAllMemory();
	}
}
