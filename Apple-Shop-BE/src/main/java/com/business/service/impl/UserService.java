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
import com.business.dto.BatchRoleUpdateDTO;
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
		userDTO.setRole(UserEntity.ROLE_CUSTOMER);
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
            admin.setRole(UserEntity.ROLE_ADMIN);
            userRepository.save(admin);
        }
    }

	@Override
	public ResponseEntity<String> changePassword(UserDTO userDTO) {
		UserEntity userEntity = userRepository.findByUsername(userDTO.getUserName());
		if (userEntity == null) {
			throw new RuntimeException("Tên người dùng không tồn tại");
		}
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
		if (userEntity == null) {
			throw new RuntimeException("User not found");
		}
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
		if (userEx == null) {
			throw new RuntimeException("User not found");
		}
		userEx = userRepository.save(userConverter.toEntity( userDTO, userEx));
		return ResponseEntity.status(HttpStatus.OK).body("Đổi thông tin tài khoản thành công");
	}

	@Override
	public ResponseEntity<String> updateRole(Long id, int role) {
		if (role != UserEntity.ROLE_CUSTOMER
				&& role != UserEntity.ROLE_ADMIN
				&& role != UserEntity.ROLE_WAREHOUSE_MANAGER
				&& role != UserEntity.ROLE_PRODUCT_MANAGER
				&& role != UserEntity.ROLE_ACCOUNTANT) {
			throw new RuntimeException("Invalid role");
		}

		UserEntity userEx = userRepository.findById(id).orElse(null);
		if (userEx == null) {
			throw new RuntimeException("User not found");
		}
		userEx.setRole(role);
		userRepository.save(userEx);
		return ResponseEntity.status(HttpStatus.OK).body("Cập nhật vai trò thành công");
	}

	@Override
	public ResponseEntity<String> updateRoleBatch(List<BatchRoleUpdateDTO> updates) {
		if (updates == null || updates.isEmpty()) {
			throw new RuntimeException("Updates list cannot be empty");
		}

		int successCount = 0;
		int failCount = 0;

		for (BatchRoleUpdateDTO updateDTO : updates) {
			try {
				if (updateDTO.getUserId() == null || updateDTO.getRole() == null) {
					failCount++;
					continue;
				}

				int role = updateDTO.getRole().intValue();
				if (role != UserEntity.ROLE_CUSTOMER
						&& role != UserEntity.ROLE_ADMIN
						&& role != UserEntity.ROLE_WAREHOUSE_MANAGER
						&& role != UserEntity.ROLE_PRODUCT_MANAGER
						&& role != UserEntity.ROLE_ACCOUNTANT) {
					failCount++;
					continue;
				}

				UserEntity user = userRepository.findById(updateDTO.getUserId()).orElse(null);
				if (user == null) {
					failCount++;
					continue;
				}

				user.setRole(role);
				userRepository.save(user);
				successCount++;
			} catch (Exception ex) {
				failCount++;
			}
		}

		String result = String.format("Cập nhật thành công %d user, thất bại %d user", successCount, failCount);
		return ResponseEntity.status(HttpStatus.OK).body(result);
	}
	
	
}

