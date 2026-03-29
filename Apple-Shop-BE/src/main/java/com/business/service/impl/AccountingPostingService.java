package com.business.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.business.entity.ChartOfAccountEntity;
import com.business.entity.JournalEntryEntity;
import com.business.entity.JournalLineEntity;
import com.business.entity.OrderEntity;
import com.business.entity.PayableEntity;
import com.business.entity.PaymentTransactionEntity;
import com.business.entity.ReceivableEntity;
import com.business.entity.StockIssueEntity;
import com.business.entity.StockReceiptEntity;
import com.business.repository.ChartOfAccountRepository;
import com.business.repository.JournalEntryRepository;
import com.business.repository.PayableRepository;
import com.business.repository.PaymentTransactionRepository;
import com.business.repository.ReceivableRepository;

@Service
public class AccountingPostingService {

    private static final int DATA_VERSION = 2;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private PayableRepository payableRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Transactional
    public void postStockReceipt(StockReceiptEntity receipt) {
        if (receipt == null || receipt.getId() == null) {
            return;
        }

        BigDecimal amount = safeMoney(receipt.getTotalCost());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        createBalancedJournalIfMissing(
                "STOCK_RECEIPT",
                receipt.getId(),
                receipt.getCode(),
                "RUNTIME_POST",
                receipt.getReceiptDate(),
                "Runtime posting - stock receipt " + safeCode(receipt.getCode(), receipt.getId(), "SR"),
                getAccountOrThrow("1561"),
                getAccountOrThrow("3311"),
                amount);

        String payableCode = "AP-SR-" + receipt.getId();
        PayableEntity payable = payableRepository.findByDocumentCode(payableCode);
        if (payable == null) {
            payable = new PayableEntity();
            payable.setDocumentCode(payableCode);
            payable.setStockReceipt(receipt);
        }

        payable.setSupplierName(receipt.getSupplier());
        payable.setDueDate(receipt.getReceiptDate());
        payable.setOutstandingAmount(amount);
        payable.setStatus("OPEN");
        payable.setDataVersion(DATA_VERSION);
        payableRepository.save(payable);
    }

    @Transactional
    public void postStockIssue(StockIssueEntity issue) {
        if (issue == null || issue.getId() == null) {
            return;
        }

        BigDecimal amount = safeMoney(issue.getTotalCost());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        createBalancedJournalIfMissing(
                "STOCK_ISSUE",
                issue.getId(),
                issue.getCode(),
                "RUNTIME_POST",
                issue.getIssueDate(),
                "Runtime posting - stock issue " + safeCode(issue.getCode(), issue.getId(), "SI"),
                getAccountOrThrow("6321"),
                getAccountOrThrow("1561"),
                amount);
    }

    @Transactional
    public void postOrderCreated(OrderEntity order) {
        if (order == null || order.getId() == null) {
            return;
        }

        BigDecimal amount = safeMoney(order.getTotalPrice());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        boolean paid = isPaidStatus(order.getPaymentStatus());
        ChartOfAccountEntity debitAccount = paid ? getAccountOrThrow("1111") : getAccountOrThrow("1311");

        createBalancedJournalIfMissing(
                "ORDER",
                order.getId(),
                order.getSku(),
                "RUNTIME_REVENUE",
                order.getOrderTime(),
                "Runtime posting - order " + safeCode(order.getSku(), order.getId(), "ORD"),
                debitAccount,
                getAccountOrThrow("5111"),
                amount);

        String receivableCode = "AR-ORD-" + order.getId();
        ReceivableEntity receivable = receivableRepository.findByDocumentCode(receivableCode);

        if (paid) {
            if (receivable != null && "OPEN".equalsIgnoreCase(receivable.getStatus())) {
                receivable.setOutstandingAmount(BigDecimal.ZERO);
                receivable.setStatus("CLOSED");
                receivable.setDataVersion(DATA_VERSION);
                receivableRepository.save(receivable);
            }
            return;
        }

        if (receivable == null) {
            receivable = new ReceivableEntity();
            receivable.setDocumentCode(receivableCode);
            receivable.setOrder(order);
            receivable.setUser(order.getUser());
        }

        receivable.setDueDate(order.getOrderTime());
        receivable.setOutstandingAmount(amount);
        receivable.setStatus("OPEN");
        receivable.setDataVersion(DATA_VERSION);
        receivableRepository.save(receivable);
    }

    @Transactional
    public void postOrderPayment(OrderEntity order) {
        if (order == null || order.getId() == null || !isPaidStatus(order.getPaymentStatus())) {
            return;
        }

        String receivableCode = "AR-ORD-" + order.getId();
        ReceivableEntity receivable = receivableRepository.findByDocumentCode(receivableCode);
        if (receivable == null) {
            return;
        }

        BigDecimal amount = safeMoney(receivable.getOutstandingAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        createBalancedJournalIfMissing(
                "ORDER_PAYMENT",
                order.getId(),
                order.getSku(),
                "RUNTIME_RECEIPT",
                order.getPaidTime() == null ? new Date() : order.getPaidTime(),
                "Runtime posting - payment " + safeCode(order.getSku(), order.getId(), "PAY"),
                getAccountOrThrow("1111"),
                getAccountOrThrow("1311"),
                amount);

        String transactionCode = "PAY-ORD-" + order.getId();
        PaymentTransactionEntity paymentTransaction = paymentTransactionRepository.findByTransactionCode(transactionCode);
        if (paymentTransaction == null) {
            paymentTransaction = new PaymentTransactionEntity();
            paymentTransaction.setTransactionCode(transactionCode);
            paymentTransaction.setOrder(order);
        }

        paymentTransaction.setTransactionDate(order.getPaidTime() == null ? new Date() : order.getPaidTime());
        paymentTransaction.setMethod(order.getPaymentMethod() == null ? "UNKNOWN" : order.getPaymentMethod());
        paymentTransaction.setDirection("IN");
        paymentTransaction.setStatus("SUCCESS");
        paymentTransaction.setAmount(amount);
        paymentTransaction.setReferenceNo(order.getSku());
        paymentTransaction.setDataVersion(DATA_VERSION);
        paymentTransactionRepository.save(paymentTransaction);

        receivable.setOutstandingAmount(BigDecimal.ZERO);
        receivable.setStatus("CLOSED");
        receivable.setDataVersion(DATA_VERSION);
        receivableRepository.save(receivable);
    }

    private ChartOfAccountEntity getAccountOrThrow(String code) {
        ChartOfAccountEntity account = chartOfAccountRepository.findByAccountCode(code);
        if (account == null) {
            throw new RuntimeException("Missing chart of account: " + code);
        }
        return account;
    }

    private void createBalancedJournalIfMissing(String sourceType, Long sourceId, String sourceCode, String entryType,
            Date entryDate, String description, ChartOfAccountEntity debitAccount, ChartOfAccountEntity creditAccount,
            BigDecimal amount) {
        if (journalEntryRepository.existsBySourceTypeAndSourceIdAndEntryType(sourceType, sourceId, entryType)) {
            return;
        }

        JournalEntryEntity entry = new JournalEntryEntity();
        entry.setEntryNumber("JE-" + sourceType + "-" + sourceId + "-" + entryType);
        entry.setEntryDate(entryDate == null ? new Date() : entryDate);
        entry.setEntryType(entryType);
        entry.setSourceType(sourceType);
        entry.setSourceId(sourceId);
        entry.setSourceCode(sourceCode);
        entry.setDescription(description);
        entry.setPostingStatus("POSTED");
        entry.setDataVersion(DATA_VERSION);
        entry.setTotalDebit(amount);
        entry.setTotalCredit(amount);

        List<JournalLineEntity> lines = new ArrayList<>();

        JournalLineEntity debitLine = new JournalLineEntity();
        debitLine.setJournalEntry(entry);
        debitLine.setAccount(debitAccount);
        debitLine.setLineNo(1);
        debitLine.setDescription(description);
        debitLine.setDebitAmount(amount);
        debitLine.setCreditAmount(BigDecimal.ZERO);
        debitLine.setCurrencyCode("VND");
        debitLine.setSourceRef(sourceCode);
        lines.add(debitLine);

        JournalLineEntity creditLine = new JournalLineEntity();
        creditLine.setJournalEntry(entry);
        creditLine.setAccount(creditAccount);
        creditLine.setLineNo(2);
        creditLine.setDescription(description);
        creditLine.setDebitAmount(BigDecimal.ZERO);
        creditLine.setCreditAmount(amount);
        creditLine.setCurrencyCode("VND");
        creditLine.setSourceRef(sourceCode);
        lines.add(creditLine);

        validateBalanced(lines);
        entry.setLines(lines);
        journalEntryRepository.save(entry);
    }

    private void validateBalanced(List<JournalLineEntity> lines) {
        BigDecimal debit = BigDecimal.ZERO;
        BigDecimal credit = BigDecimal.ZERO;
        for (JournalLineEntity line : lines) {
            debit = debit.add(safeMoney(line.getDebitAmount()));
            credit = credit.add(safeMoney(line.getCreditAmount()));
        }

        if (debit.compareTo(credit) != 0) {
            throw new RuntimeException("Unbalanced journal entry in runtime posting");
        }
    }

    private BigDecimal safeMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value;
    }

    private String safeCode(String sourceCode, Long sourceId, String prefix) {
        if (sourceCode != null && !sourceCode.trim().isEmpty()) {
            return sourceCode;
        }
        return prefix + "-" + sourceId;
    }

    private boolean isPaidStatus(String paymentStatus) {
        if (paymentStatus == null) {
            return false;
        }

        String normalized = paymentStatus.toLowerCase(Locale.ROOT);
        return normalized.contains("đã thanh toán") || normalized.contains("da thanh toan")
                || normalized.contains("paid") || normalized.contains("success");
    }
}
