package com.business.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

@Entity
@Table(name = "color")
public class ColorEntity extends BaseEntity {
	@Column(name = "color")
	private String color;
	
	@Column(name = "code")
	private String code;

	@ManyToMany(mappedBy = "colors", cascade = CascadeType.ALL)
	private List<ProductEntity> products = new ArrayList<>();
	
	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public List<ProductEntity> getProducts() {
		return products;
	}

	public void setProducts(List<ProductEntity> products) {
		this.products = products;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}
	
	
	
}
