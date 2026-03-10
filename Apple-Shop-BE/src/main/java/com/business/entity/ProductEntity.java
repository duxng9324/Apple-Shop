package com.business.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "product")
public class ProductEntity extends BaseEntity {
	@Column(name = "name")
	private String name;
	
	@Column(name = "product_code")
	private String code;
	
	@Column(name = "image_link")
	private String imgLink;

	@Column(name = "description")
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "category_id", referencedColumnName = "id")
	private CategoryEntity category;
	
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CartEntity> cart = new ArrayList<>();
	
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductMemoryEntity> memories = new ArrayList<>();
	
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CommentEntity> comments = new ArrayList<>();
	
	@ManyToMany
	@JoinTable(name = "product_color",
	joinColumns = @JoinColumn(name = "product_id", referencedColumnName = "id"),
	inverseJoinColumns = @JoinColumn(name = "color_id", referencedColumnName = "id"))
	private List<ColorEntity> colors = new ArrayList<>();
	
	
	public String getCode() {
		return code;
	}
	
	public void setCode(String code) {
		this.code = code;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	public CategoryEntity getCategory() {
		return category;
	}

	public void setCategory(CategoryEntity category) {
		this.category = category;
	}
	
	
	public List<CommentEntity> getComments() {
		return comments;
	}
	
	public void setComments(List<CommentEntity> comments) {
		this.comments = comments;
	}

	public List<ProductMemoryEntity> getMemories() {
		return memories;
	}

	public void setMemories(List<ProductMemoryEntity> memories) {
		this.memories = memories;
	}


	public String getImgLink() {
		return imgLink;
	}

	public void setImgLink(String imgLink) {
		this.imgLink = imgLink;
	}

	public List<ColorEntity> getColors() {
		return colors;
	}

	public void setColors(List<ColorEntity> colors) {
		this.colors = colors;
	}

	public List<CartEntity> getCart() {
		return cart;
	}

	public void setCart(List<CartEntity> cart) {
		this.cart = cart;
	}

	
	
	
}
/*
 * referencedColumnName = "id" thuộc tính này chỉ định tên trường tham chiếu trong bảng liên quan, nếu không
 * có thuộc tính này jpa sẽ sử dụng mặc định trường id để làm tham chiếu vì vậy để rõ ràng hơn ta nên sử dụng thuộc tính này
 * */

