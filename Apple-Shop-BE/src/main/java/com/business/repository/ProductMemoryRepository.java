package com.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.business.entity.ProductMemoryEntity;

@Repository
public interface ProductMemoryRepository extends JpaRepository<ProductMemoryEntity, Long>{
	ProductMemoryEntity findByProductIdAndMemoryId(Long productId, Long memoryId);
	List<ProductMemoryEntity> findByProductId(Long productId);
	@Modifying
	@Query("delete from ProductMemoryEntity pm where pm.product.id = :productId")
	void delete(@Param("productId") Long productId);
}

