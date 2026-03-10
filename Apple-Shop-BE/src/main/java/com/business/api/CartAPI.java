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

import com.business.dto.CartDTO;
import com.business.service.impl.CartService;

@CrossOrigin
@RestController
public class CartAPI {
	
	@Autowired
	private CartService cartService;
	
	@PostMapping(value = "/api/cart")
	public ResponseEntity<CartDTO> addCart(@RequestBody CartDTO model) {
		try {
			CartDTO cartDTO = cartService.save(model);
			return ResponseEntity.ok(cartDTO);
			
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
    }
	@PutMapping(value = "/api/cart/{id}")
	public ResponseEntity<CartDTO> updateCart(@RequestBody CartDTO model, @PathVariable("id") long id) {
		try {	
			model.setId(id);
			return ResponseEntity.ok(cartService.save(model));
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	@DeleteMapping(value = "/api/cart/{id}")
	public void deleteCart(@PathVariable("id") long id) {
		cartService.delete(id);
	}
	
	@GetMapping(value = "/api/cart/user/{id}")
	public List<CartDTO> getCartByUserId(@PathVariable long id) {
		return cartService.getCartByUserId(id);
	}
	
	@DeleteMapping(value = "/api/cart/user/{id}")
	public void deleteCartbyUserId(@PathVariable("id") Long id) {
		cartService.deleteByUserId(id);
	}
	
	
}
