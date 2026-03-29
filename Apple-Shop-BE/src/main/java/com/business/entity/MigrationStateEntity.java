package com.business.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

@Entity
@Table(name = "migration_state", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "migration_key" })
})
public class MigrationStateEntity extends BaseEntity {

    @Column(name = "migration_key", nullable = false, length = 128)
    private String migrationKey;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "executed_at", nullable = false)
    private Date executedAt;

    @Column(name = "notes", length = 500)
    private String notes;

    public String getMigrationKey() {
        return migrationKey;
    }

    public void setMigrationKey(String migrationKey) {
        this.migrationKey = migrationKey;
    }

    public Date getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Date executedAt) {
        this.executedAt = executedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
