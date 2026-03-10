package com.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.business.entity.ProductEntity;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
	ProductEntity findByCode(String code);
	ProductEntity findByName(String name);
	List<ProductEntity> findAllByCategoryId(long id);
	@Modifying
	@Query("select p from ProductEntity p where p.category.code = :category")
	List<ProductEntity> findByCategoryName(@Param("category") String category);
}
