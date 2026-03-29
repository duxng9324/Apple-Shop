package com.business.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.business.entity.ChartOfAccountEntity;
import com.business.entity.JournalEntryEntity;
import com.business.entity.JournalLineEntity;
import com.business.entity.MigrationStateEntity;
import com.business.entity.OrderEntity;
import com.business.entity.PayableEntity;
import com.business.entity.ReceivableEntity;
import com.business.entity.StockIssueEntity;
import com.business.entity.StockReceiptEntity;
import com.business.repository.ChartOfAccountRepository;
import com.business.repository.JournalEntryRepository;
import com.business.repository.MigrationStateRepository;
import com.business.repository.OrderRepository;
import com.business.repository.PayableRepository;
import com.business.repository.ReceivableRepository;
import com.business.repository.StockIssueRepository;
import com.business.repository.StockReceiptRepository;

@Component
public class AccountingPhase1BootstrapRunner implements CommandLineRunner {

    private static final String MIGRATION_KEY = "ACC_PHASE1_BOOTSTRAP_V1";
    private static final int DATA_VERSION = 1;

    @Autowired
    private MigrationStateRepository migrationStateRepository;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private StockReceiptRepository stockReceiptRepository;

    @Autowired
    private StockIssueRepository stockIssueRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private PayableRepository payableRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        bootstrapPhase1IfNeeded();
    }

    @Transactional
    public void bootstrapPhase1IfNeeded() {
        MigrationStateEntity state = migrationStateRepository.findByMigrationKey(MIGRATION_KEY);
        if (state != null) {
            return;
        }

        seedChartOfAccounts();

        ChartOfAccountEntity inventoryAccount = getAccountOrThrow("1561");
        ChartOfAccountEntity payableAccount = getAccountOrThrow("3311");
        ChartOfAccountEntity cogsAccount = getAccountOrThrow("6321");
        ChartOfAccountEntity revenueAccount = getAccountOrThrow("5111");
        ChartOfAccountEntity cashAccount = getAccountOrThrow("1111");
        ChartOfAccountEntity receivableAccount = getAccountOrThrow("1311");

        backfillStockReceipts(inventoryAccount, payableAccount);
        backfillStockIssues(cogsAccount, inventoryAccount);
        backfillOrders(revenueAccount, cashAccount, receivableAccount);

        MigrationStateEntity done = new MigrationStateEntity();
        done.setMigrationKey(MIGRATION_KEY);
        done.setExecutedAt(new Date());
        done.setNotes("Seeded COA and backfilled opening journals for stock/order sources.");
        migrationStateRepository.save(done);
    }

    private void seedChartOfAccounts() {
        saveAccountIfMissing("1111", "Tiền mặt", "ASSET", "DEBIT");
        saveAccountIfMissing("1311", "Phải thu khách hàng", "ASSET", "DEBIT");
        saveAccountIfMissing("1561", "Hàng tồn kho", "ASSET", "DEBIT");
        saveAccountIfMissing("3311", "Phải trả nhà cung cấp", "LIABILITY", "CREDIT");
        saveAccountIfMissing("5111", "Doanh thu bán hàng", "REVENUE", "CREDIT");
        saveAccountIfMissing("6321", "Giá vốn hàng bán", "EXPENSE", "DEBIT");
    }

    private void saveAccountIfMissing(String code, String name, String accountType, String normalBalance) {
        ChartOfAccountEntity existing = chartOfAccountRepository.findByAccountCode(code);
        if (existing != null) {
            return;
        }

        ChartOfAccountEntity account = new ChartOfAccountEntity();
        account.setAccountCode(code);
        account.setAccountName(name);
        account.setAccountType(accountType);
        account.setNormalBalance(normalBalance);
        account.setActive(Boolean.TRUE);
        chartOfAccountRepository.save(account);
    }

    private ChartOfAccountEntity getAccountOrThrow(String code) {
        ChartOfAccountEntity account = chartOfAccountRepository.findByAccountCode(code);
        if (account == null) {
            throw new RuntimeException("Missing chart of account: " + code);
        }
        return account;
    }

    private void backfillStockReceipts(ChartOfAccountEntity inventoryAccount, ChartOfAccountEntity payableAccount) {
        List<StockReceiptEntity> receipts = stockReceiptRepository.findAll();
        for (StockReceiptEntity receipt : receipts) {
            if (receipt == null || receipt.getId() == null) {
                continue;
            }
            if (journalEntryRepository.existsBySourceTypeAndSourceIdAndEntryType("STOCK_RECEIPT", receipt.getId(),
                    "OPENING")) {
                continue;
            }

            BigDecimal amount = safeMoney(receipt.getTotalCost());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            String sourceCode = receipt.getCode();
            if (sourceCode == null) {
                sourceCode = "STOCK_RECEIPT-" + receipt.getId();
            }

            String desc = "Opening migration - stock receipt " + sourceCode;
            createBalancedJournalEntry("STOCK_RECEIPT", receipt.getId(), sourceCode, "OPENING", receipt.getReceiptDate(),
                    desc, inventoryAccount, payableAccount, amount);

            PayableEntity payable = new PayableEntity();
            payable.setDocumentCode("AP-OPEN-" + receipt.getId());
            payable.setSupplierName(receipt.getSupplier());
            payable.setStockReceipt(receipt);
            payable.setDueDate(receipt.getReceiptDate());
            payable.setOutstandingAmount(amount);
            payable.setStatus("OPEN");
            payable.setDataVersion(Integer.valueOf(DATA_VERSION));
            payableRepository.save(payable);
        }
    }

    private void backfillStockIssues(ChartOfAccountEntity cogsAccount, ChartOfAccountEntity inventoryAccount) {
        List<StockIssueEntity> issues = stockIssueRepository.findAll();
        for (StockIssueEntity issue : issues) {
            if (issue == null || issue.getId() == null) {
                continue;
            }
            if (journalEntryRepository.existsBySourceTypeAndSourceIdAndEntryType("STOCK_ISSUE", issue.getId(),
                    "OPENING")) {
                continue;
            }

            BigDecimal amount = safeMoney(issue.getTotalCost());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            String sourceCode = issue.getCode();
            if (sourceCode == null) {
                sourceCode = "STOCK_ISSUE-" + issue.getId();
            }

            String desc = "Opening migration - stock issue " + sourceCode;
            createBalancedJournalEntry("STOCK_ISSUE", issue.getId(), sourceCode, "OPENING", issue.getIssueDate(), desc,
                    cogsAccount, inventoryAccount, amount);
        }
    }

    private void backfillOrders(ChartOfAccountEntity revenueAccount, ChartOfAccountEntity cashAccount,
            ChartOfAccountEntity receivableAccount) {
        List<OrderEntity> orders = orderRepository.findAll();
        for (OrderEntity order : orders) {
            if (order == null || order.getId() == null) {
                continue;
            }
            if (isCanceled(order.getStatus())) {
                continue;
            }
            if (journalEntryRepository.existsBySourceTypeAndSourceIdAndEntryType("ORDER", order.getId(), "OPENING")) {
                stampOrderVersion(order);
                continue;
            }

            BigDecimal amount = safeMoney(order.getTotalPrice());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                stampOrderVersion(order);
                continue;
            }

            ChartOfAccountEntity debitAccount = isPaidOrder(order) ? cashAccount : receivableAccount;
            String sourceCode = order.getSku();
            if (sourceCode == null) {
                sourceCode = "ORDER-" + order.getId();
            }

            String desc = "Opening migration - order " + sourceCode;
            createBalancedJournalEntry("ORDER", order.getId(), sourceCode, "OPENING", order.getOrderTime(), desc,
                    debitAccount, revenueAccount, amount);

            if (!isPaidOrder(order)) {
                ReceivableEntity receivable = new ReceivableEntity();
                receivable.setDocumentCode("AR-OPEN-" + order.getId());
                receivable.setOrder(order);
                receivable.setUser(order.getUser());
                receivable.setDueDate(order.getOrderTime());
                receivable.setOutstandingAmount(amount);
                receivable.setStatus("OPEN");
                receivable.setDataVersion(Integer.valueOf(DATA_VERSION));
                receivableRepository.save(receivable);
            }

            stampOrderVersion(order);
        }
    }

    private void stampOrderVersion(OrderEntity order) {
        Integer version = order.getAccountingDataVersion();
        if (version != null && version.intValue() >= DATA_VERSION) {
            return;
        }
        order.setAccountingDataVersion(Integer.valueOf(DATA_VERSION));
        orderRepository.save(order);
    }

    private void createBalancedJournalEntry(String sourceType, Long sourceId, String sourceCode, String entryType,
            Date entryDate, String description, ChartOfAccountEntity debitAccount, ChartOfAccountEntity creditAccount,
            BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
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
        entry.setDataVersion(Integer.valueOf(DATA_VERSION));
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

        entry.setLines(lines);
        validateBalanced(lines, amount);
        journalEntryRepository.save(entry);
    }

    private void validateBalanced(List<JournalLineEntity> lines, BigDecimal expectedAmount) {
        BigDecimal debit = BigDecimal.ZERO;
        BigDecimal credit = BigDecimal.ZERO;
        for (JournalLineEntity line : lines) {
            debit = debit.add(safeMoney(line.getDebitAmount()));
            credit = credit.add(safeMoney(line.getCreditAmount()));
        }

        if (debit.compareTo(credit) != 0 || debit.compareTo(expectedAmount) != 0) {
            throw new RuntimeException("Unbalanced journal entry in migration bootstrap");
        }
    }

    private boolean isCanceled(String status) {
        if (status == null) {
            return false;
        }

        String normalized = status.toLowerCase(Locale.ROOT);
        return normalized.contains("huy") || normalized.contains("cancel");
    }

    private boolean isPaidOrder(OrderEntity order) {
        if (order == null || order.getPaymentStatus() == null) {
            return false;
        }

        String paymentStatus = order.getPaymentStatus().toLowerCase(Locale.ROOT);
        return paymentStatus.contains("đã thanh toán") || paymentStatus.contains("da thanh toan")
                || paymentStatus.contains("paid");
    }

    private BigDecimal safeMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value;
    }
}
