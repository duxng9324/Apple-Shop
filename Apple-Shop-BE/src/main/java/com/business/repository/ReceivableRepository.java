package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.ReceivableEntity;

@Repository
public interface ReceivableRepository extends JpaRepository<ReceivableEntity, Long> {

    List<ReceivableEntity> findByDueDateBeforeAndStatus(Date dueDate, String status);

    ReceivableEntity findByDocumentCode(String documentCode);
}
