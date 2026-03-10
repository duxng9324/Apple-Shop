package com.business.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class OrderDTO {
	private Long id;
	private String sku;
	private String fullName;
	private String sex;
	private String orderPhone;
	private String email;
	private Date orderTime;
	private String orderAddress;
	private BigDecimal totalPrice;
	private String status;
	private int checkCmt;
	
	private Long userId;
	private List<OrderItemDTO> orderItemDTOs = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	public String getOrderPhone() {
		return orderPhone;
	}

	public void setOrderPhone(String orderPhone) {
		this.orderPhone = orderPhone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Date getOrderTime() {
		return orderTime;
	}

	public void setOrderTime(Date orderTime) {
		this.orderTime = orderTime;
	}

	public String getOrderAddress() {
		return orderAddress;
	}

	public void setOrderAddress(String orderAddress) {
		this.orderAddress = orderAddress;
	}

	public BigDecimal getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(BigDecimal totalPrice) {
		this.totalPrice = totalPrice;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public List<OrderItemDTO> getOrderItemDTOs() {
		return orderItemDTOs;
	}

	public void setOrderItemDTOs(List<OrderItemDTO> orderItemDTOs) {
		this.orderItemDTOs = orderItemDTOs;
	}

	public int getCheckCmt() {
		return checkCmt;
	}

	public void setCheckCmt(int checkCmt) {
		this.checkCmt = checkCmt;
	}
	
	
}
