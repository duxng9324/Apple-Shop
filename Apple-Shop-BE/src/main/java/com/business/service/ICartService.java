package com.business.service;

import java.util.List;

import com.business.dto.CartDTO;

public interface ICartService {
	CartDTO save(CartDTO cartDTO);
	void delete(long id);
	List<CartDTO> getCartByUserId(Long id);
	void deleteByUserId(Long UserId);
}
