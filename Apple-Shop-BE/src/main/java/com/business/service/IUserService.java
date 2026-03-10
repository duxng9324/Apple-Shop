package com.business.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.business.dto.UserDTO;

public interface IUserService {
		UserDTO save(UserDTO userDTO);
		ResponseEntity<String> login(String userName, String password);
		ResponseEntity<String> changePassword(UserDTO userDTO);
		UserDTO getUserById(Long id);
		List<UserDTO> getAllUser();
		void delete(Long id);
		ResponseEntity<String> changeInfo(UserDTO userDTO, Long id);
}
