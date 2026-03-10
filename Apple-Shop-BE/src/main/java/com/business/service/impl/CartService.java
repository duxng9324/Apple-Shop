package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.CartConverter;
import com.business.dto.CartDTO;
import com.business.entity.CartEntity;
import com.business.repository.CartRepository;
import com.business.service.ICartService;

@Service
public class CartService implements ICartService {

	@Autowired
	private CartConverter cartCoverter;
	
	@Autowired
	private CartRepository cartRepository;
	
	@Override
	public CartDTO save(CartDTO cartDTO) {
		CartEntity cartEntity = new CartEntity();
		if(cartDTO.getId() != null) {
			   CartEntity existingCart = cartRepository.findById(cartDTO.getId()).orElse(null);
			cartEntity = cartRepository.save(cartCoverter.toEntity(cartDTO, existingCart));
		}
		else {
			CartEntity exCart = cartRepository.findItem(cartDTO.getUserId(), cartDTO.getProductId(), cartDTO.getMemory(), cartDTO.getColor());
			if(exCart != null) {
				cartDTO.setQuantity(exCart.getQuantity() + 1);
				cartEntity = cartRepository.save(cartCoverter.toEntity(cartDTO, exCart));
			}
			else {
				cartDTO.setQuantity(Long.valueOf(1L));
				cartEntity = cartRepository.save(cartCoverter.toEntity(cartDTO));
			}
		}
		return cartCoverter.toDTO(cartEntity);
	}

	@Override
	public void delete(long id) {
			   cartRepository.deleteById(id);
	}

	@Override
	public List<CartDTO> getCartByUserId(Long id) {
		List<CartEntity> cartEntities = cartRepository.findByUserId(id);
		List<CartDTO> cartDTOs = new ArrayList<>();
		for(CartEntity cartEntity : cartEntities) {
			CartDTO cartDTO = cartCoverter.toDTO(cartEntity);
			cartDTOs.add(cartDTO);
		}
		return cartDTOs;
	}

	@Override
	public void deleteByUserId(Long UserId) {
		cartRepository.deleteByUserId(UserId);
	}


}
