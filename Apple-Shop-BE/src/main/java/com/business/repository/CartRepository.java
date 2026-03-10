package com.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.business.entity.CartEntity;

@Repository
@Transactional
public interface CartRepository extends JpaRepository<CartEntity, Long> {
	List<CartEntity> findByUserId(Long id);

	@Query("select c from CartEntity c where c.user.id = :userId AND c.product.id = :productId AND c.memory = :memory AND c.color = :color")
	CartEntity findItem(@Param("userId") Long userId, @Param("productId") Long productId, @Param("memory") String memory, @Param("color") String color);
	
	@Modifying
	@Query("delete from CartEntity c where c.user.id = :userId")
	void deleteByUserId(@Param("userId") Long userId);
}
