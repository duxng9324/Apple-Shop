package com.business.dto;

import java.util.List;

public class ProductDTO extends AbstractDTO {
	private String name;
	private String code;
	private String categoryCode;
	private String description;
	private String imgLinks;
	private List<Long> colors;
	private List<TypeDTO> list;
	
	private CategoryDTO categoryDTO;
	private List<ColorDTO> colorDTOs;
	private List<CommentDTO> commentDTOs;
	
	
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
	public String getCategoryCode() {
		return categoryCode;
	}
	public void setCategoryCode(String categoryCode) {
		this.categoryCode = categoryCode;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public List<Long> getColors() {
		return colors;
	}
	public void setColors(List<Long> colors) {
		this.colors = colors;
	}
	public String getImgLinks() {
		return imgLinks;
	}
	public void setImgLinks(String imgLinks) {
		this.imgLinks = imgLinks;
	}
	public List<TypeDTO> getList() {
		return list;
	}
	public void setList(List<TypeDTO> list) {
		this.list = list;
	}
	public CategoryDTO getCategoryDTO() {
		return categoryDTO;
	}
	public void setCategoryDTO(CategoryDTO categoryDTO) {
		this.categoryDTO = categoryDTO;
	}
	public List<ColorDTO> getColorDTOs() {
		return colorDTOs;
	}
	public void setColorDTOs(List<ColorDTO> colorDTOs) {
		this.colorDTOs = colorDTOs;
	}
	public List<CommentDTO> getCommentDTOs() {
		return commentDTOs;
	}
	public void setCommentDTOs(List<CommentDTO> commentDTOs) {
		this.commentDTOs = commentDTOs;
	}

	
	
	
}
