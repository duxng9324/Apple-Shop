package com.business.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.ExpenseVoucherEntity;

@Repository
public interface ExpenseVoucherRepository extends JpaRepository<ExpenseVoucherEntity, Long> {

    List<ExpenseVoucherEntity> findByVoucherDateBetween(Date fromDate, Date toDate);
}
