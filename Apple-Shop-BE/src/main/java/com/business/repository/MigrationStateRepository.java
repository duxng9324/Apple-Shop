package com.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.business.entity.MigrationStateEntity;

@Repository
public interface MigrationStateRepository extends JpaRepository<MigrationStateEntity, Long> {

    MigrationStateEntity findByMigrationKey(String migrationKey);
}
