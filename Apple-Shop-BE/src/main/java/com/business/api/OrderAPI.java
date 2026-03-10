package com.business.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.OrderDTO;
import com.business.service.impl.OrderService;

@CrossOrigin
@RestController
public class OrderAPI {
	@Autowired
	private OrderService orderService;
	
	@PostMapping(value = "/api/order")
	public ResponseEntity<OrderDTO> addOrder(@RequestBody OrderDTO model) {
		try {
			OrderDTO orderDTO = orderService.save(model);
			return ResponseEntity.ok(orderDTO);
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	@PutMapping(value = "/api/order/confirm/{id}")
	public ResponseEntity<OrderDTO> updateStatusOrder(@PathVariable long id, @RequestBody OrderDTO model) {
		try {
			String status = model.getStatus();
			OrderDTO orderDTO = orderService.updateStatusOrder(id, status);
			return ResponseEntity.ok(orderDTO);
		} catch(RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	@GetMapping(value = "/api/order/user/{id}")
	public List<OrderDTO> getOrderByUserId(@PathVariable long id) {
		return orderService.getOrderByUserId(id);
	}
	@GetMapping(value = "/api/order")
	public List<OrderDTO> getAllOrder() {
		return orderService.getAllOrder();
	}
	@PutMapping(value = "api/order/change/{id}")
	String changeCheckOrder(@PathVariable Long id) {
		return orderService.changeCheck(id);
	}
}
