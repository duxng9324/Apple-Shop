package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.InventoryMovementLedgerEntity;

@Repository
public interface InventoryMovementLedgerRepository extends JpaRepository<InventoryMovementLedgerEntity, Long> {

    List<InventoryMovementLedgerEntity> findByMovementDateBetween(Date fromDate, Date toDate);
}
