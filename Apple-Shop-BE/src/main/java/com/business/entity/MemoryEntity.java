package com.business.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "memory")
public class MemoryEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="type")
	private String type;
	
	@OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductMemoryEntity> products = new ArrayList<>();
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<ProductMemoryEntity> getProducts() {
		return products;
	}

	public void setProducts(List<ProductMemoryEntity> products) {
		this.products = products;
	}
	
	
}
