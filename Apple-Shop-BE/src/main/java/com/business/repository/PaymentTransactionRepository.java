package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.PaymentTransactionEntity;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, Long> {

    List<PaymentTransactionEntity> findByTransactionDateBetween(Date fromDate, Date toDate);

    PaymentTransactionEntity findByTransactionCode(String transactionCode);
}
