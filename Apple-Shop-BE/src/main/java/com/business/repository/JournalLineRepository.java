package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.JournalLineEntity;

@Repository
public interface JournalLineRepository extends JpaRepository<JournalLineEntity, Long> {
}
