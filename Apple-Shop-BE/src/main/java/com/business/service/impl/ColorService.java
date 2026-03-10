package com.business.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.converter.ColorConverter;
import com.business.dto.ColorDTO;
import com.business.entity.ColorEntity;
import com.business.repository.ColorRepository;
import com.business.service.IColorService;

@Service
public class ColorService implements IColorService {
	@Autowired	
	private ColorRepository colorRepository;
	
	@Autowired
	private ColorConverter colorConverter;

	@Override
	public ColorDTO save(ColorDTO colorDTO) {
		ColorEntity colorEntity = new ColorEntity();
		if(colorDTO.getId() != null) {
			   ColorEntity existingColor = colorRepository.findById(colorDTO.getId()).orElse(null);
			colorEntity = colorConverter.toEntity(colorDTO,existingColor);
		} else {
			colorEntity = colorConverter.toEntity(colorDTO);
		}
		colorRepository.save(colorEntity);
		return colorConverter.toDTO(colorEntity);
	}

	@Override
	public void delete(long id) {
		
			   colorRepository.deleteById(id);
		
	}

	@Override
	public List<ColorDTO> getAllColor() {
		List<ColorEntity> colorsEntity = colorRepository.findAll();
		List<ColorDTO> colorsDTO = new ArrayList<>();
		for(ColorEntity colorEntity : colorsEntity) {
			ColorDTO colorDTO = colorConverter.toDTO(colorEntity);
			colorsDTO.add(colorDTO);
		}
		return colorsDTO;
	}

}
