package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.JournalEntryEntity;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntryEntity, Long> {

    boolean existsBySourceTypeAndSourceIdAndEntryType(String sourceType, Long sourceId, String entryType);

    List<JournalEntryEntity> findByEntryDateBetween(Date fromDate, Date toDate);
}
