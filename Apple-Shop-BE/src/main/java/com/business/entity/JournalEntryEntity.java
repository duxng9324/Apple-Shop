package com.business.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.UniqueConstraint;

@Entity
@Table(name = "journal_entry", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "entry_number" }),
        @UniqueConstraint(columnNames = { "source_type", "source_id", "entry_type" })
})
public class JournalEntryEntity extends BaseEntity {

    @Column(name = "entry_number", nullable = false, length = 64)
    private String entryNumber;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "entry_date", nullable = false)
    private Date entryDate;

    @Column(name = "entry_type", nullable = false, length = 64)
    private String entryType;

    @Column(name = "source_type", length = 64)
    private String sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "source_code", length = 128)
    private String sourceCode;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "posting_status", nullable = false, length = 32)
    private String postingStatus;

    @Column(name = "data_version", nullable = false)
    private Integer dataVersion = 1;

    @Column(name = "total_debit", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalDebit = BigDecimal.ZERO;

    @Column(name = "total_credit", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalCredit = BigDecimal.ZERO;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalLineEntity> lines = new ArrayList<JournalLineEntity>();

    public String getEntryNumber() {
        return entryNumber;
    }

    public void setEntryNumber(String entryNumber) {
        this.entryNumber = entryNumber;
    }

    public Date getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(Date entryDate) {
        this.entryDate = entryDate;
    }

    public String getEntryType() {
        return entryType;
    }

    public void setEntryType(String entryType) {
        this.entryType = entryType;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPostingStatus() {
        return postingStatus;
    }

    public void setPostingStatus(String postingStatus) {
        this.postingStatus = postingStatus;
    }

    public Integer getDataVersion() {
        return dataVersion;
    }

    public void setDataVersion(Integer dataVersion) {
        this.dataVersion = dataVersion;
    }

    public BigDecimal getTotalDebit() {
        return totalDebit;
    }

    public void setTotalDebit(BigDecimal totalDebit) {
        this.totalDebit = totalDebit;
    }

    public BigDecimal getTotalCredit() {
        return totalCredit;
    }

    public void setTotalCredit(BigDecimal totalCredit) {
        this.totalCredit = totalCredit;
    }

    public List<JournalLineEntity> getLines() {
        return lines;
    }

    public void setLines(List<JournalLineEntity> lines) {
        this.lines = lines;
    }
}
