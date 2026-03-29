package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.OrderDTO;
import com.business.entity.UserEntity;
import com.business.repository.UserRepository;
import com.business.service.impl.OrderService;

@CrossOrigin
@RestController
public class OrderAPI {
	@Autowired
	private OrderService orderService;

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
	
	@PostMapping(value = "/api/order")
	public ResponseEntity<?> addOrder(@RequestBody OrderDTO model) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser)) {
				model.setUserId(currentUser.getId());
			}

			OrderDTO orderDTO = orderService.save(model);
			return ResponseEntity.ok(orderDTO);
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
	
	@PutMapping(value = "/api/order/confirm/{id}")
	public ResponseEntity<?> updateStatusOrder(@PathVariable long id, @RequestBody OrderDTO model,
			@RequestParam(value = "strategy", required = false, defaultValue = "FIFO") String strategy) {
		try {
			String status = model.getStatus();
			String paymentStatus = model.getPaymentStatus();
			OrderDTO orderDTO = orderService.updateStatusOrder(id, status, paymentStatus, strategy);
			return ResponseEntity.ok(orderDTO);
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@PutMapping(value = "/api/order/payment/{id}")
	public ResponseEntity<?> markOrderPaid(@PathVariable long id) {
		try {
			OrderDTO orderDTO = orderService.markOrderPaid(id);
			return ResponseEntity.ok(orderDTO);
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
	
	@GetMapping(value = "/api/order/user/{id}")
	public ResponseEntity<?> getOrderByUserId(@PathVariable long id) {
		try {
			UserEntity currentUser = getCurrentUserOrThrow();
			if (!isAdmin(currentUser) && !currentUser.getId().equals(id)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
			}

			return ResponseEntity.ok(orderService.getOrderByUserId(id));
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}

	@GetMapping(value = "/api/order")
	public List<OrderDTO> getAllOrder() {
		return orderService.getAllOrder();
	}

	@PutMapping(value = "api/order/change/{id}")
	ResponseEntity<?> changeCheckOrder(@PathVariable Long id) {
		try {
			return ResponseEntity.ok(orderService.changeCheck(id));
		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
		}
	}
}
