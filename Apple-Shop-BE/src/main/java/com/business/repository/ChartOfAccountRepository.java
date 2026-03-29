package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.ChartOfAccountEntity;

@Repository
public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccountEntity, Long> {

    ChartOfAccountEntity findByAccountCode(String accountCode);
}
