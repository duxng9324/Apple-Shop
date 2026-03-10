package com.business.api;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

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

import com.business.dto.UserDTO;
import com.business.service.impl.UserService;

@CrossOrigin
@RestController 
public class UserAPI {
	@Autowired
	private UserService userService;
	
	@PostMapping(value = "/api/signup")
    public ResponseEntity<UserDTO> addUser(@RequestBody UserDTO model) {
		try {
			UserDTO userDTO = userService.save(model);
			return ResponseEntity.ok(userDTO);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
    }
	
	@PostMapping(value = "/api/login")
	public ResponseEntity<String> login(HttpServletRequest request,@RequestBody UserDTO model) {
		try {
			return userService.login(model.getUserName(), model.getPassword());
		} catch(RuntimeException ex) {
			if(ex.getMessage().equals("Tên người dùng không tồn tại")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên người dùng không tồn tại");
			}
			else if(ex.getMessage().equals("Mật khẩu không chính xác")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu không chính xác");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lỗi khác");
		}
	}
	
	@PutMapping(value = "/api/changepass")
	public ResponseEntity<String> changePassword(@RequestBody UserDTO model) {
		try {
			return userService.changePassword(model);
		} catch (RuntimeException ex) {
			if(ex.getMessage().equals("Mật khẩu không chính xác")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu không chính xác");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lỗi khác");
		}
	}
	
	@GetMapping(value = "api/user/{id}")
	public UserDTO getUserById(@PathVariable("id") Long id) {
		return userService.getUserById(id);
	}
	
	@GetMapping(value = "api/user")
	public List<UserDTO> getAllUserDTO(){
		return userService.getAllUser();
	}
	
	@DeleteMapping(value = "api/user/{id}")
	public void deleteUser(@PathVariable("id") Long id) {
		userService.delete(id);
	}
	@PutMapping(value = "api/user/{id}")
	public ResponseEntity<String> changeInfo(@RequestBody UserDTO model, @PathVariable Long id ) {
		try {
			return userService.changeInfo(model, id);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lỗi khác");
		}
	}
	
}
