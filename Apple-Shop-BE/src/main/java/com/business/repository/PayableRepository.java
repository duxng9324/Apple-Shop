package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.PayableEntity;

@Repository
public interface PayableRepository extends JpaRepository<PayableEntity, Long> {

    List<PayableEntity> findByDueDateBeforeAndStatus(Date dueDate, String status);

    PayableEntity findByDocumentCode(String documentCode);
}
