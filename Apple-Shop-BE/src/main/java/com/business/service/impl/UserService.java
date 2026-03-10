package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.business.converter.UserConverter;
import com.business.dto.UserDTO;
import com.business.entity.UserEntity;
import com.business.repository.UserRepository;
import com.business.service.IUserService;

@Service
public class UserService implements IUserService {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private UserConverter userConverter;

	@Autowired
	private JwtService jwtService;

	@Override
	public UserDTO save(UserDTO userDTO) {
		UserEntity userEntity = new UserEntity();
		UserEntity existingUser = userRepository.findByUsername(userDTO.getUserName());
		if(existingUser != null) {
			throw new RuntimeException("Username đã được sử dụng");
		}
		String hashedPassWord = BCrypt.hashpw(userDTO.getPassword(), BCrypt.gensalt());
		userDTO.setPassword(hashedPassWord);
		userEntity = userRepository.save(userConverter.toEntity(userDTO));
		return userConverter.toDTO(userEntity);
	}

	@Override
	public ResponseEntity<String> login(String userName, String password) {
		UserEntity userEntity = userRepository.findByUsername(userName);
	    if(userEntity == null) {
	        throw new RuntimeException("Tên người dùng không tồn tại");
	    }
	    if(!BCrypt.checkpw(password, userEntity.getPassword())) {
	        throw new RuntimeException("Mật khẩu không chính xác");
	    } 
	    HttpStatus httpStatus = HttpStatus.OK;
	    String token = jwtService.generateTokenLogin(userEntity.getUsername(), userEntity.getRole(), userEntity.getFullName(), userEntity.getId());
	    return ResponseEntity.status(httpStatus).body(token);
	}
	
	//add account admin for website
	@PostConstruct
    public void createAdminAccount() {
        UserEntity existingAdmin = userRepository.findByUsername("admin");
        if (existingAdmin == null) {
            UserEntity admin = new UserEntity();
            admin.setUsername("admin");
            admin.setPassword(BCrypt.hashpw("password", BCrypt.gensalt()));
            admin.setRole(1);
            userRepository.save(admin);
        }
    }

	@Override
	public ResponseEntity<String> changePassword(UserDTO userDTO) {
		UserEntity userEntity = userRepository.findByUsername(userDTO.getUserName());
		String passType = userDTO.getPassword();
		if(!BCrypt.checkpw(passType, userEntity.getPassword())) {
	        throw new RuntimeException("Mật khẩu không chính xác");
	    } 
		else {
			String hashedPassWord = BCrypt.hashpw(userDTO.getNewPass(), BCrypt.gensalt());
			userEntity.setPassword(hashedPassWord);
			userEntity = userRepository.save(userEntity);
			return ResponseEntity.status(HttpStatus.OK).body("Đổi mật khẩu thành công");
		}
	}

	@Override
	public UserDTO getUserById(Long id) {
			   UserEntity userEntity = userRepository.findById(id).orElse(null);
		return userConverter.toDTO(userEntity);
	}

	@Override
	public List<UserDTO> getAllUser() {
		List<UserEntity> entities = userRepository.findAll();
		List<UserDTO> dtos = new ArrayList<>();
		for(UserEntity userEntity : entities) {
			UserDTO userDTO = userConverter.toDTO(userEntity);
			dtos.add(userDTO);
		}
		return dtos;
	}

	@Override
	public void delete(Long id) {
			   userRepository.deleteById(id);
	}

	@Override
	public ResponseEntity<String> changeInfo(UserDTO userDTO, Long id) {
			   UserEntity userEx = userRepository.findById(id).orElse(null);
		userEx = userRepository.save(userConverter.toEntity( userDTO, userEx));
		return ResponseEntity.status(HttpStatus.OK).body("Đổi thông tin tài khoản thành công");
	}
	
	
}
