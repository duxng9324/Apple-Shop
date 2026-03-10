package com.business.dto;

import java.math.BigDecimal;

public class TypeDTO {
	private BigDecimal price;
	private String type;
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	
}
