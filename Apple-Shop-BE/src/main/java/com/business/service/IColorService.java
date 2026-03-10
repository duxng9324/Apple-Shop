package com.business.service;

import java.util.List;

import com.business.dto.ColorDTO;

public interface IColorService {
	ColorDTO save(ColorDTO colorDTO);
	void delete(long id);
	List<ColorDTO> getAllColor();
}
