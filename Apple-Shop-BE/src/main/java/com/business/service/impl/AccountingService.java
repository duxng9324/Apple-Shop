package com.business.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.business.dto.AccountItemDTO;
import com.business.dto.AccountingDashboardDTO;
import com.business.dto.AccountingReportDTO;
import com.business.dto.AccountingVoucherDTO;
import com.business.dto.DashboardTrendPointDTO;
import com.business.dto.ExpenseCategorySummaryDTO;
import com.business.dto.JournalEntryViewDTO;
import com.business.dto.PayableAgingDTO;
import com.business.dto.PaymentMethodSummaryDTO;
import com.business.dto.ProductSaleRatioDTO;
import com.business.dto.ReceivableAgingDTO;
import com.business.dto.ReconciliationSummaryDTO;
import com.business.entity.ChartOfAccountEntity;
import com.business.entity.ExpenseVoucherEntity;
import com.business.entity.InventoryEntity;
import com.business.entity.JournalEntryEntity;
import com.business.entity.OrderEntity;
import com.business.entity.OrderItemEntity;
import com.business.entity.PayableEntity;
import com.business.entity.PaymentTransactionEntity;
import com.business.entity.ReceivableEntity;
import com.business.entity.StockIssueEntity;
import com.business.entity.StockReceiptItemEntity;
import com.business.repository.ChartOfAccountRepository;
import com.business.repository.ExpenseVoucherRepository;
import com.business.repository.InventoryRepository;
import com.business.repository.JournalEntryRepository;
import com.business.repository.OrderRepository;
import com.business.repository.PayableRepository;
import com.business.repository.PaymentTransactionRepository;
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

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private ExpenseVoucherRepository expenseVoucherRepository;

    @Override
    public AccountingReportDTO getBusinessSummary(Date fromDate, Date toDate) {
        Date[] normalizedRange = resolveRange(fromDate, toDate, new Date(0L), new Date());
        Date from = normalizedRange[0];
        Date to = normalizedRange[1];

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
        accounts.sort(Comparator.comparing(account -> account.getAccountCode() == null ? "" : account.getAccountCode()));
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
        Date[] normalizedRange = resolveRange(fromDate, toDate, new Date(0L), new Date());
        Date from = normalizedRange[0];
        Date to = normalizedRange[1];

        List<JournalEntryViewDTO> results = new ArrayList<>();
        List<JournalEntryEntity> entries = journalEntryRepository.findByEntryDateBetween(from, to);
        entries.sort(Comparator
            .comparing(JournalEntryEntity::getEntryDate, Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing(JournalEntryEntity::getId, Comparator.nullsLast(Comparator.reverseOrder())));
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

        results.sort(Comparator
                .comparing(ReceivableAgingDTO::getOverdueDays, Comparator.nullsLast(Integer::compareTo)).reversed()
                .thenComparing(ReceivableAgingDTO::getDueDate, Comparator.nullsLast(Date::compareTo)));
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

        results.sort(Comparator
                .comparing(PayableAgingDTO::getOverdueDays, Comparator.nullsLast(Integer::compareTo)).reversed()
                .thenComparing(PayableAgingDTO::getDueDate, Comparator.nullsLast(Date::compareTo)));
        return results;
    }

    @Override
    public ReconciliationSummaryDTO getReconciliationSummary() {
        BigDecimal inventoryLedgerValue = BigDecimal.ZERO;
        BigDecimal inventoryLayerValue = BigDecimal.ZERO;

        List<InventoryEntity> inventories = inventoryRepository.findAll();
        for (InventoryEntity inventory : inventories) {
            BigDecimal unitCost = inventory.getUnitCost() == null ? BigDecimal.ZERO : inventory.getUnitCost();
            Integer quantity = inventory.getQuantity();
            long qty = quantity == null ? 0L : quantity.longValue();
            inventoryLedgerValue = inventoryLedgerValue.add(unitCost.multiply(BigDecimal.valueOf(qty)));
        }

        List<StockReceiptItemEntity> layers = stockReceiptItemRepository.findAll();
        for (StockReceiptItemEntity layer : layers) {
            BigDecimal unitCost = layer.getUnitCost() == null ? BigDecimal.ZERO : layer.getUnitCost();
            Integer remainingQty = layer.getRemainingQuantity();
            long qty = remainingQty == null ? 0L : remainingQty.longValue();
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

    @Override
    public List<AccountingVoucherDTO> getCashReceipts(Date fromDate, Date toDate) {
        Date[] normalizedRange = resolveRange(fromDate, toDate, new Date(0L), new Date());
        Date from = normalizedRange[0];
        Date to = normalizedRange[1];

        List<AccountingVoucherDTO> results = new ArrayList<>();
        List<PaymentTransactionEntity> transactions = paymentTransactionRepository.findByTransactionDateBetween(from, to);
        for (PaymentTransactionEntity transaction : transactions) {
            if (transaction == null || transaction.getTransactionDate() == null) {
                continue;
            }

            String direction = transaction.getDirection() == null ? "" : transaction.getDirection().toUpperCase(Locale.ROOT);
            if (!"IN".equals(direction)) {
                continue;
            }

            if (!isSuccessfulStatus(transaction.getStatus())) {
                continue;
            }

            AccountingVoucherDTO dto = new AccountingVoucherDTO();
            dto.setVoucherCode(transaction.getTransactionCode());
            dto.setVoucherDate(transaction.getTransactionDate());
            dto.setVoucherType("PHIEU_THU");
            dto.setDirection("IN");
            dto.setMethod(transaction.getMethod());
            dto.setReferenceNo(transaction.getReferenceNo());
            dto.setStatus(transaction.getStatus());
            dto.setAmount(transaction.getAmount() == null ? BigDecimal.ZERO : transaction.getAmount());

            if (transaction.getOrder() != null) {
                dto.setCounterparty(transaction.getOrder().getFullName());
                dto.setDescription("Thu tiền đơn hàng " + transaction.getOrder().getSku());
            } else {
                dto.setCounterparty("Khách lẻ");
                dto.setDescription("Thu tiền giao dịch bán hàng");
            }

            results.add(dto);
        }

        results.sort(Comparator
                .comparing(AccountingVoucherDTO::getVoucherDate, Comparator.nullsLast(Date::compareTo))
                .reversed()
                .thenComparing(AccountingVoucherDTO::getVoucherCode, Comparator.nullsLast(String::compareTo)));
        return results;
    }

    @Override
    public List<AccountingVoucherDTO> getCashPayments(Date fromDate, Date toDate) {
        Date[] normalizedRange = resolveRange(fromDate, toDate, new Date(0L), new Date());
        Date from = normalizedRange[0];
        Date to = normalizedRange[1];

        List<AccountingVoucherDTO> results = new ArrayList<>();

        List<ExpenseVoucherEntity> vouchers = expenseVoucherRepository.findByVoucherDateBetween(from, to);
        for (ExpenseVoucherEntity voucher : vouchers) {
            if (voucher == null || voucher.getVoucherDate() == null) {
                continue;
            }

            String status = voucher.getStatus() == null ? "" : voucher.getStatus().toLowerCase(Locale.ROOT);
            if (status.contains("huy") || status.contains("cancel") || status.contains("void")) {
                continue;
            }

            AccountingVoucherDTO dto = new AccountingVoucherDTO();
            dto.setVoucherCode(voucher.getCode());
            dto.setVoucherDate(voucher.getVoucherDate());
            dto.setVoucherType("PHIEU_CHI");
            dto.setDirection("OUT");
            dto.setMethod("CASH");
            dto.setStatus(voucher.getStatus());
            dto.setAmount(voucher.getAmount() == null ? BigDecimal.ZERO : voucher.getAmount());
            dto.setDescription(voucher.getDescription());
            dto.setReferenceNo(voucher.getExpenseCategory());
            if (voucher.getWarehouse() != null) {
                dto.setCounterparty(voucher.getWarehouse().getName());
            } else {
                dto.setCounterparty("Chi nội bộ");
            }

            results.add(dto);
        }

        List<PaymentTransactionEntity> transactions = paymentTransactionRepository.findByTransactionDateBetween(from, to);
        for (PaymentTransactionEntity transaction : transactions) {
            if (transaction == null || transaction.getTransactionDate() == null) {
                continue;
            }

            String direction = transaction.getDirection() == null ? "" : transaction.getDirection().toUpperCase(Locale.ROOT);
            if (!"OUT".equals(direction)) {
                continue;
            }

            if (!isSuccessfulStatus(transaction.getStatus())) {
                continue;
            }

            AccountingVoucherDTO dto = new AccountingVoucherDTO();
            dto.setVoucherCode(transaction.getTransactionCode());
            dto.setVoucherDate(transaction.getTransactionDate());
            dto.setVoucherType("PHIEU_CHI");
            dto.setDirection("OUT");
            dto.setMethod(transaction.getMethod());
            dto.setReferenceNo(transaction.getReferenceNo());
            dto.setStatus(transaction.getStatus());
            dto.setAmount(transaction.getAmount() == null ? BigDecimal.ZERO : transaction.getAmount());

            if (transaction.getOrder() != null) {
                dto.setCounterparty(transaction.getOrder().getFullName());
                dto.setDescription("Chi tiền giao dịch cho đơn hàng " + transaction.getOrder().getSku());
            } else {
                dto.setCounterparty("Khác");
                dto.setDescription("Chi tiền giao dịch");
            }

            results.add(dto);
        }

        results.sort(Comparator
                .comparing(AccountingVoucherDTO::getVoucherDate, Comparator.nullsLast(Date::compareTo))
                .reversed()
                .thenComparing(AccountingVoucherDTO::getVoucherCode, Comparator.nullsLast(String::compareTo)));
        return results;
    }

    @Override
    public AccountingDashboardDTO getDashboard(Date fromDate, Date toDate) {
        Calendar nowCalendar = Calendar.getInstance();
        nowCalendar.set(Calendar.MONTH, Calendar.JANUARY);
        nowCalendar.set(Calendar.DAY_OF_MONTH, 1);
        nowCalendar.set(Calendar.HOUR_OF_DAY, 0);
        nowCalendar.set(Calendar.MINUTE, 0);
        nowCalendar.set(Calendar.SECOND, 0);
        nowCalendar.set(Calendar.MILLISECOND, 0);

        Date[] normalizedRange = resolveRange(fromDate, toDate, nowCalendar.getTime(), new Date());
        Date from = normalizedRange[0];
        Date to = normalizedRange[1];

        List<OrderEntity> orders = orderRepository.findByOrderTimeBetween(from, to);
        List<StockIssueEntity> issues = stockIssueRepository.findByIssueDateBetween(from, to);
        List<ExpenseVoucherEntity> expenseVouchers = expenseVoucherRepository.findByVoucherDateBetween(from, to);
        List<PaymentTransactionEntity> transactions = paymentTransactionRepository.findByTransactionDateBetween(from, to);

        BigDecimal revenue = BigDecimal.ZERO;
        int orderCount = 0;
        int totalProductQuantity = 0;
        Map<String, Integer> productQtyIndex = new HashMap<>();

        for (OrderEntity order : orders) {
            if (order == null || isCancelledOrder(order)) {
                continue;
            }

            if (order.getTotalPrice() != null) {
                revenue = revenue.add(order.getTotalPrice());
            }
            orderCount++;

            List<OrderItemEntity> orderItems = order.getProductOrders();
            if (orderItems == null) {
                continue;
            }

            for (OrderItemEntity item : orderItems) {
                if (item == null || item.getQuantity() <= 0) {
                    continue;
                }

                String productName = item.getName();
                if (productName == null || productName.trim().isEmpty()) {
                    productName = "Sản phẩm khác";
                }

                Integer existingQty = productQtyIndex.get(productName);
                if (existingQty == null) {
                    existingQty = 0;
                }

                int newQty = existingQty + item.getQuantity();
                productQtyIndex.put(productName, newQty);
                totalProductQuantity += item.getQuantity();
            }
        }

        BigDecimal cogs = BigDecimal.ZERO;
        for (StockIssueEntity issue : issues) {
            if (issue != null && issue.getTotalCost() != null) {
                cogs = cogs.add(issue.getTotalCost());
            }
        }

        BigDecimal expense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseIndex = new HashMap<>();
        for (ExpenseVoucherEntity voucher : expenseVouchers) {
            if (voucher == null) {
                continue;
            }

            String status = voucher.getStatus() == null ? "" : voucher.getStatus().toLowerCase(Locale.ROOT);
            if (status.contains("huy") || status.contains("cancel") || status.contains("void")) {
                continue;
            }

            BigDecimal amount = voucher.getAmount() == null ? BigDecimal.ZERO : voucher.getAmount();
            expense = expense.add(amount);

            String category = voucher.getExpenseCategory();
            if (category == null || category.trim().isEmpty()) {
                category = "Khác";
            }
            BigDecimal existing = expenseIndex.get(category);
            if (existing == null) {
                existing = BigDecimal.ZERO;
            }
            expenseIndex.put(category, existing.add(amount));
        }

        BigDecimal cashIn = BigDecimal.ZERO;
        BigDecimal cashOutFromTransactions = BigDecimal.ZERO;
        Map<String, BigDecimal> paymentMethodIndex = new HashMap<>();
        for (PaymentTransactionEntity transaction : transactions) {
            if (transaction == null || !isSuccessfulStatus(transaction.getStatus())) {
                continue;
            }

            BigDecimal amount = transaction.getAmount() == null ? BigDecimal.ZERO : transaction.getAmount();
            String direction = transaction.getDirection() == null ? "" : transaction.getDirection().toUpperCase(Locale.ROOT);
            if ("IN".equals(direction)) {
                cashIn = cashIn.add(amount);
                String method = transaction.getMethod();
                if (method == null || method.trim().isEmpty()) {
                    method = "UNKNOWN";
                }
                BigDecimal existing = paymentMethodIndex.get(method);
                if (existing == null) {
                    existing = BigDecimal.ZERO;
                }
                paymentMethodIndex.put(method, existing.add(amount));
            } else if ("OUT".equals(direction)) {
                cashOutFromTransactions = cashOutFromTransactions.add(amount);
            }
        }

        BigDecimal profit = revenue.subtract(cogs).subtract(expense);
        BigDecimal grossMargin = BigDecimal.ZERO;
        if (revenue.compareTo(BigDecimal.ZERO) > 0) {
            grossMargin = profit.multiply(new BigDecimal("100")).divide(revenue, 2, RoundingMode.HALF_UP);
        }

        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (orderCount > 0) {
            avgOrderValue = revenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP);
        }

        AccountingDashboardDTO dashboard = new AccountingDashboardDTO();
        dashboard.setFromDate(from);
        dashboard.setToDate(to);
        dashboard.setRevenue(revenue);
        dashboard.setCostOfGoodsSold(cogs);
        dashboard.setExpense(expense);
        dashboard.setProfit(profit);
        dashboard.setGrossMarginPercent(grossMargin);
        dashboard.setNetCashInflow(cashIn.subtract(expense.add(cashOutFromTransactions)));
        dashboard.setAvgOrderValue(avgOrderValue);
        dashboard.setTotalOrders(orderCount);

        Map<String, DashboardTrendPointDTO> trendIndex = new HashMap<>();
        Date monthCursor = startOfMonth(from);
        Date monthEnd = startOfMonth(to);
        while (!monthCursor.after(monthEnd)) {
            String key = monthKey(monthCursor);
            DashboardTrendPointDTO point = new DashboardTrendPointDTO();
            point.setPeriod(monthLabel(monthCursor));
            point.setRevenue(BigDecimal.ZERO);
            point.setCostOfGoodsSold(BigDecimal.ZERO);
            point.setExpense(BigDecimal.ZERO);
            point.setProfit(BigDecimal.ZERO);
            trendIndex.put(key, point);
            monthCursor = addOneMonth(monthCursor);
        }

        for (OrderEntity order : orders) {
            if (order == null || isCancelledOrder(order) || order.getOrderTime() == null || order.getTotalPrice() == null) {
                continue;
            }
            DashboardTrendPointDTO point = trendIndex.get(monthKey(order.getOrderTime()));
            if (point != null) {
                point.setRevenue(point.getRevenue().add(order.getTotalPrice()));
            }
        }

        for (StockIssueEntity issue : issues) {
            if (issue == null || issue.getIssueDate() == null || issue.getTotalCost() == null) {
                continue;
            }
            DashboardTrendPointDTO point = trendIndex.get(monthKey(issue.getIssueDate()));
            if (point != null) {
                point.setCostOfGoodsSold(point.getCostOfGoodsSold().add(issue.getTotalCost()));
            }
        }

        for (ExpenseVoucherEntity voucher : expenseVouchers) {
            if (voucher == null || voucher.getVoucherDate() == null || voucher.getAmount() == null) {
                continue;
            }
            String status = voucher.getStatus() == null ? "" : voucher.getStatus().toLowerCase(Locale.ROOT);
            if (status.contains("huy") || status.contains("cancel") || status.contains("void")) {
                continue;
            }
            DashboardTrendPointDTO point = trendIndex.get(monthKey(voucher.getVoucherDate()));
            if (point != null) {
                point.setExpense(point.getExpense().add(voucher.getAmount()));
            }
        }

        List<String> monthKeys = new ArrayList<>(trendIndex.keySet());
        monthKeys.sort(String::compareTo);
        List<DashboardTrendPointDTO> trendResults = new ArrayList<>();
        for (String monthKey : monthKeys) {
            DashboardTrendPointDTO point = trendIndex.get(monthKey);
            point.setProfit(point.getRevenue().subtract(point.getCostOfGoodsSold()).subtract(point.getExpense()));
            trendResults.add(point);
        }
        dashboard.setMonthlyTrend(trendResults);

        List<Map.Entry<String, Integer>> productEntries = new ArrayList<>(productQtyIndex.entrySet());
        productEntries.sort((left, right) -> Integer.compare(right.getValue(), left.getValue()));
        List<ProductSaleRatioDTO> productRatios = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : productEntries) {
            ProductSaleRatioDTO product = new ProductSaleRatioDTO();
            product.setProductName(entry.getKey());
            product.setQuantitySold(entry.getValue());

            BigDecimal ratio = BigDecimal.ZERO;
            if (totalProductQuantity > 0) {
                ratio = BigDecimal.valueOf(entry.getValue())
                        .multiply(new BigDecimal("100"))
                        .divide(BigDecimal.valueOf(totalProductQuantity), 2, RoundingMode.HALF_UP);
            }
            product.setRatioPercent(ratio);
            productRatios.add(product);

            if (productRatios.size() >= 8) {
                break;
            }
        }
        dashboard.setProductSaleRatios(productRatios);

        List<Map.Entry<String, BigDecimal>> expenseEntries = new ArrayList<>(expenseIndex.entrySet());
        expenseEntries.sort((left, right) -> right.getValue().compareTo(left.getValue()));
        List<ExpenseCategorySummaryDTO> expenseSummaries = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : expenseEntries) {
            ExpenseCategorySummaryDTO summary = new ExpenseCategorySummaryDTO();
            summary.setExpenseCategory(entry.getKey());
            summary.setAmount(entry.getValue());
            expenseSummaries.add(summary);
        }
        dashboard.setExpenseByCategory(expenseSummaries);

        List<Map.Entry<String, BigDecimal>> paymentEntries = new ArrayList<>(paymentMethodIndex.entrySet());
        paymentEntries.sort((left, right) -> right.getValue().compareTo(left.getValue()));
        List<PaymentMethodSummaryDTO> paymentSummaries = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : paymentEntries) {
            PaymentMethodSummaryDTO summary = new PaymentMethodSummaryDTO();
            summary.setPaymentMethod(entry.getKey());
            summary.setAmount(entry.getValue());
            paymentSummaries.add(summary);
        }
        dashboard.setPaymentMethodBreakdown(paymentSummaries);

        return dashboard;
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

    private boolean isCancelledOrder(OrderEntity order) {
        if (order == null || order.getStatus() == null) {
            return false;
        }
        String status = order.getStatus().toLowerCase(Locale.ROOT);
        return status.contains("huy") || status.contains("cancel") || status.contains("void");
    }

    private boolean isSuccessfulStatus(String status) {
        if (status == null) {
            return true;
        }
        String normalized = status.toLowerCase(Locale.ROOT);
        return normalized.contains("success")
                || normalized.contains("succeed")
                || normalized.contains("paid")
                || normalized.contains("posted")
                || normalized.contains("approved")
                || normalized.contains("đã")
                || normalized.contains("da ");
    }

    private Date startOfMonth(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    private Date addOneMonth(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.MONTH, 1);
        return calendar.getTime();
    }

    private String monthKey(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1;
        return String.format("%04d-%02d", year, month);
    }

    private String monthLabel(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1;
        return String.format("%02d/%04d", month, year);
    }

    private Date[] resolveRange(Date fromDate, Date toDate, Date defaultFrom, Date defaultTo) {
        Date from = fromDate == null ? defaultFrom : fromDate;
        Date to = toDate == null ? defaultTo : toDate;

        if (from.after(to)) {
            Date temp = from;
            from = to;
            to = temp;
        }

        return new Date[] { from, to };
    }
}
