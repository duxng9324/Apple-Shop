package com.business.api;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.AccountItemDTO;
import com.business.dto.AccountingDashboardDTO;
import com.business.dto.AccountingReportDTO;
import com.business.dto.AccountingVoucherDTO;
import com.business.dto.JournalEntryViewDTO;
import com.business.dto.PayableAgingDTO;
import com.business.dto.ReceivableAgingDTO;
import com.business.dto.ReconciliationSummaryDTO;
import com.business.service.IAccountingService;

@CrossOrigin
@RestController
public class AccountingAPI {

    @Autowired
    private IAccountingService accountingService;

    @GetMapping(value = "/api/accounting/report")
    public AccountingReportDTO getSummary(
            @RequestParam(value = "from", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(value = "to", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return accountingService.getBusinessSummary(fromDate, toDate);
    }

    @GetMapping(value = "/api/accounting/coa")
    public List<AccountItemDTO> getChartOfAccounts() {
        return accountingService.getChartOfAccounts();
    }

    @GetMapping(value = "/api/accounting/journal")
    public List<JournalEntryViewDTO> getJournal(
            @RequestParam(value = "from", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(value = "to", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return accountingService.getJournalEntries(fromDate, toDate);
    }

    @GetMapping(value = "/api/accounting/ar-aging")
    public List<ReceivableAgingDTO> getReceivableAging(
            @RequestParam(value = "asOf", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date asOfDate) {
        return accountingService.getReceivableAging(asOfDate);
    }

    @GetMapping(value = "/api/accounting/ap-aging")
    public List<PayableAgingDTO> getPayableAging(
            @RequestParam(value = "asOf", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date asOfDate) {
        return accountingService.getPayableAging(asOfDate);
    }

    @GetMapping(value = "/api/accounting/reconciliation")
    public ReconciliationSummaryDTO getReconciliationSummary() {
        return accountingService.getReconciliationSummary();
    }

    @GetMapping(value = "/api/accounting/cash-receipts")
    public List<AccountingVoucherDTO> getCashReceipts(
            @RequestParam(value = "from", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(value = "to", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return accountingService.getCashReceipts(fromDate, toDate);
    }

    @GetMapping(value = "/api/accounting/cash-payments")
    public List<AccountingVoucherDTO> getCashPayments(
            @RequestParam(value = "from", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(value = "to", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return accountingService.getCashPayments(fromDate, toDate);
    }

    @GetMapping(value = "/api/accounting/dashboard")
    public AccountingDashboardDTO getDashboard(
            @RequestParam(value = "from", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(value = "to", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        return accountingService.getDashboard(fromDate, toDate);
    }
}
