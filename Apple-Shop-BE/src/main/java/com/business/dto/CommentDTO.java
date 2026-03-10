package com.business.dto;

import java.util.Date;

public class CommentDTO{
	private Long id;
	private Date timeRep;
	private Date timeCmt;
	private String comment;
	private Long adminId;
	private String reply;
	private Long rating;
	private String productName;
	private Long userId;
	private String userName;
	private String adminName;
	private UserDTO user;
	
	
	public UserDTO getUser() {
		return user;
	}
	public void setUser(UserDTO user) {
		this.user = user;
	}
	public String getProductName() {
		return productName;
	}
	public void setProductName(String productName) {
		this.productName = productName;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public Long getAdminId() {
		return adminId;
	}
	public void setAdminId(Long adminId) {
		this.adminId = adminId;
	}
	public String getReply() {
		return reply;
	}
	public void setReply(String reply) {
		this.reply = reply;
	}
	

	public Long getRating() {
		return rating;
	}
	public void setRating(Long rating) {
		this.rating = rating;
	}
	
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getAdminName() {
		return adminName;
	}
	public void setAdminName(String adminName) {
		this.adminName = adminName;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Date getTimeRep() {
		return timeRep;
	}
	public void setTimeRep(Date timeRep) {
		this.timeRep = timeRep;
	}
	public Date getTimeCmt() {
		return timeCmt;
	}
	public void setTimeCmt(Date timeCmt) {
		this.timeCmt = timeCmt;
	}
	
	
}
