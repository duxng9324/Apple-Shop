package com.business.api;

import java.util.List;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.business.dto.BatchRoleUpdateDTO;
import com.business.entity.UserEntity;
import com.business.repository.UserRepository;
import com.business.service.impl.UserService;

@CrossOrigin
@RestController 
public class UserAPI {
	@Autowired
	private UserService userService;

	@Autowired
	private UserRepository userRepository;

	private UserEntity getCurrentUserOrThrow() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getName() == null) {
			throw new RuntimeException("Unauthorized");
		}

		UserEntity currentUser = userRepository.findByUsername(authentication.getName());
		if (currentUser == null) {
			throw new RuntimeException("Unauthorized");
		}
		return currentUser;
	}

	private boolean isAdmin(UserEntity user) {
		return user != null && user.getRole() == UserEntity.ROLE_ADMIN;
	}
	
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
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser)) {
				model.setUserName(currentUser.getUsername());
			}
			return userService.changePassword(model);
		} catch (RuntimeException ex) {
			if(ex.getMessage().equals("Mật khẩu không chính xác")) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu không chính xác");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("lỗi khác");
		}
	}
	
	@GetMapping(value = "api/user/{id}")
	public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser) && !currentUser.getId().equals(id)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
			}
			return ResponseEntity.ok(userService.getUserById(id));
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
	
	@GetMapping(value = "api/user")
	public List<UserDTO> getAllUserDTO(){
		return userService.getAllUser();
	}
	
	@DeleteMapping(value = "api/user/{id}")
	public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
		try {
			userService.delete(id);
			return ResponseEntity.ok("Deleted");
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@PutMapping(value = "api/user/{id}")
	public ResponseEntity<String> changeInfo(@RequestBody UserDTO model, @PathVariable Long id ) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser) && !currentUser.getId().equals(id)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
			}
			return userService.changeInfo(model, id);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@PutMapping(value = "api/user/{id}/role")
	public ResponseEntity<String> updateRole(@PathVariable Long id, @RequestBody UserDTO model) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
			}
			return userService.updateRole(id, model.getRole());
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@PutMapping("/api/user/batch/role")
	public ResponseEntity<String> updateRoleBatch(@RequestBody List<BatchRoleUpdateDTO> updates) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
			}
			return userService.updateRoleBatch(updates);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
}

