package com.business.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.dto.AccountItemDTO;
import com.business.dto.AccountingReportDTO;
import com.business.dto.JournalEntryViewDTO;
import com.business.dto.PayableAgingDTO;
import com.business.dto.ReceivableAgingDTO;
import com.business.dto.ReconciliationSummaryDTO;
import com.business.entity.ChartOfAccountEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.JournalEntryEntity;
import com.business.entity.OrderEntity;
import com.business.entity.PayableEntity;
import com.business.entity.ReceivableEntity;
import com.business.entity.StockIssueEntity;
import com.business.entity.StockReceiptItemEntity;
import com.business.repository.ChartOfAccountRepository;
import com.business.repository.InventoryRepository;
import com.business.repository.JournalEntryRepository;
import com.business.repository.OrderRepository;
import com.business.repository.PayableRepository;
import com.business.repository.ReceivableRepository;
import com.business.repository.StockIssueRepository;
import com.business.repository.StockReceiptItemRepository;
import com.business.service.IAccountingService;

@Service
public class AccountingService implements IAccountingService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StockIssueRepository stockIssueRepository;

    @Autowired
    private ChartOfAccountRepository chartOfAccountRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private PayableRepository payableRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockReceiptItemRepository stockReceiptItemRepository;

    @Override
    public AccountingReportDTO getBusinessSummary(Date fromDate, Date toDate) {
        Date from = fromDate == null ? new Date(0L) : fromDate;
        Date to = toDate == null ? new Date() : toDate;

        List<OrderEntity> orders = orderRepository.findByOrderTimeBetween(from, to);
        List<StockIssueEntity> issues = stockIssueRepository.findByIssueDateBetween(from, to);

        BigDecimal revenue = BigDecimal.ZERO;
        int orderCount = 0;

        for (OrderEntity order : orders) {
            if (order.getTotalPrice() == null) {
                continue;
            }

            String status = order.getStatus() == null ? "" : order.getStatus().toLowerCase();
            if (status.contains("huy") || status.contains("cancel")) {
                continue;
            }

            revenue = revenue.add(order.getTotalPrice());
            orderCount++;
        }

        BigDecimal cogs = BigDecimal.ZERO;
        for (StockIssueEntity issue : issues) {
            if (issue.getTotalCost() != null) {
                cogs = cogs.add(issue.getTotalCost());
            }
        }

        BigDecimal profit = revenue.subtract(cogs);
        BigDecimal margin = BigDecimal.ZERO;
        if (revenue.compareTo(BigDecimal.ZERO) > 0) {
            margin = profit.multiply(new BigDecimal("100")).divide(revenue, 2, RoundingMode.HALF_UP);
        }

        AccountingReportDTO dto = new AccountingReportDTO();
        dto.setFromDate(from);
        dto.setToDate(to);
        dto.setRevenue(revenue);
        dto.setCostOfGoodsSold(cogs);
        dto.setGrossProfit(profit);
        dto.setGrossMarginPercent(margin);
        dto.setTotalOrders(orderCount);
        dto.setTotalStockIssueVouchers(issues.size());
        return dto;
    }

    @Override
    public List<AccountItemDTO> getChartOfAccounts() {
        List<AccountItemDTO> results = new ArrayList<>();
        List<ChartOfAccountEntity> accounts = chartOfAccountRepository.findAll();
        for (ChartOfAccountEntity account : accounts) {
            AccountItemDTO dto = new AccountItemDTO();
            dto.setId(account.getId());
            dto.setAccountCode(account.getAccountCode());
            dto.setAccountName(account.getAccountName());
            dto.setAccountType(account.getAccountType());
            dto.setNormalBalance(account.getNormalBalance());
            dto.setActive(account.getActive());
            results.add(dto);
        }
        return results;
    }

    @Override
    public List<JournalEntryViewDTO> getJournalEntries(Date fromDate, Date toDate) {
        Date from = fromDate == null ? new Date(0L) : fromDate;
        Date to = toDate == null ? new Date() : toDate;

        List<JournalEntryViewDTO> results = new ArrayList<>();
        List<JournalEntryEntity> entries = journalEntryRepository.findByEntryDateBetween(from, to);
        for (JournalEntryEntity entry : entries) {
            JournalEntryViewDTO dto = new JournalEntryViewDTO();
            dto.setId(entry.getId());
            dto.setEntryNumber(entry.getEntryNumber());
            dto.setEntryDate(entry.getEntryDate());
            dto.setEntryType(entry.getEntryType());
            dto.setSourceType(entry.getSourceType());
            dto.setSourceId(entry.getSourceId());
            dto.setSourceCode(entry.getSourceCode());
            dto.setDescription(entry.getDescription());
            dto.setPostingStatus(entry.getPostingStatus());
            dto.setTotalDebit(entry.getTotalDebit());
            dto.setTotalCredit(entry.getTotalCredit());
            results.add(dto);
        }
        return results;
    }

    @Override
    public List<ReceivableAgingDTO> getReceivableAging(Date asOfDate) {
        Date anchor = asOfDate == null ? new Date() : asOfDate;

        List<ReceivableAgingDTO> results = new ArrayList<>();
        List<ReceivableEntity> receivables = receivableRepository.findAll();
        for (ReceivableEntity entity : receivables) {
            ReceivableAgingDTO dto = new ReceivableAgingDTO();
            dto.setDocumentCode(entity.getDocumentCode());
            if (entity.getUser() != null) {
                dto.setCustomerName(entity.getUser().getFullName());
            }
            dto.setDueDate(entity.getDueDate());
            dto.setOutstandingAmount(entity.getOutstandingAmount());
            dto.setStatus(entity.getStatus());
            dto.setOverdueDays(calculateOverdueDays(anchor, entity.getDueDate()));
            results.add(dto);
        }
        return results;
    }

    @Override
    public List<PayableAgingDTO> getPayableAging(Date asOfDate) {
        Date anchor = asOfDate == null ? new Date() : asOfDate;

        List<PayableAgingDTO> results = new ArrayList<>();
        List<PayableEntity> payables = payableRepository.findAll();
        for (PayableEntity entity : payables) {
            PayableAgingDTO dto = new PayableAgingDTO();
            dto.setDocumentCode(entity.getDocumentCode());
            dto.setSupplierName(entity.getSupplierName());
            dto.setDueDate(entity.getDueDate());
            dto.setOutstandingAmount(entity.getOutstandingAmount());
            dto.setStatus(entity.getStatus());
            dto.setOverdueDays(calculateOverdueDays(anchor, entity.getDueDate()));
            results.add(dto);
        }
        return results;
    }

    @Override
    public ReconciliationSummaryDTO getReconciliationSummary() {
        BigDecimal inventoryLedgerValue = BigDecimal.ZERO;
        BigDecimal inventoryLayerValue = BigDecimal.ZERO;

        List<InventoryEntity> inventories = inventoryRepository.findAll();
        for (InventoryEntity inventory : inventories) {
            BigDecimal unitCost = inventory.getUnitCost() == null ? BigDecimal.ZERO : inventory.getUnitCost();
            int qty = inventory.getQuantity() == null ? 0 : inventory.getQuantity().intValue();
            inventoryLedgerValue = inventoryLedgerValue.add(unitCost.multiply(BigDecimal.valueOf(qty)));
        }

        List<StockReceiptItemEntity> layers = stockReceiptItemRepository.findAll();
        for (StockReceiptItemEntity layer : layers) {
            BigDecimal unitCost = layer.getUnitCost() == null ? BigDecimal.ZERO : layer.getUnitCost();
            int qty = layer.getRemainingQuantity() == null ? 0 : layer.getRemainingQuantity().intValue();
            inventoryLayerValue = inventoryLayerValue.add(unitCost.multiply(BigDecimal.valueOf(qty)));
        }

        ReconciliationSummaryDTO dto = new ReconciliationSummaryDTO();
        dto.setInventoryLedgerValue(inventoryLedgerValue);
        dto.setInventoryLayerValue(inventoryLayerValue);
        dto.setInventoryGap(inventoryLedgerValue.subtract(inventoryLayerValue));
        dto.setInventoryRowCount(Long.valueOf(inventories.size()));
        dto.setLayerRowCount(Long.valueOf(layers.size()));
        return dto;
    }

    private Integer calculateOverdueDays(Date asOfDate, Date dueDate) {
        if (asOfDate == null || dueDate == null) {
            return 0;
        }

        long diffMs = asOfDate.getTime() - dueDate.getTime();
        if (diffMs <= 0) {
            return 0;
        }

        long days = TimeUnit.MILLISECONDS.toDays(diffMs);
        return (int) days;
    }
}
