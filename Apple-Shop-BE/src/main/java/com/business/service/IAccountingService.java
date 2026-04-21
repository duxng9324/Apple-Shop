package com.business.service;

import java.util.Date;
import java.util.List;

import com.business.dto.AccountItemDTO;
import com.business.dto.AccountingDashboardDTO;
import com.business.dto.AccountingReportDTO;
import com.business.dto.AccountingVoucherDTO;
import com.business.dto.JournalEntryViewDTO;
import com.business.dto.PayableAgingDTO;
import com.business.dto.ReceivableAgingDTO;
import com.business.dto.ReconciliationSummaryDTO;

public interface IAccountingService {
    AccountingReportDTO getBusinessSummary(Date fromDate, Date toDate);

    List<AccountItemDTO> getChartOfAccounts();

    List<JournalEntryViewDTO> getJournalEntries(Date fromDate, Date toDate);

    List<ReceivableAgingDTO> getReceivableAging(Date asOfDate);

    List<PayableAgingDTO> getPayableAging(Date asOfDate);

    ReconciliationSummaryDTO getReconciliationSummary();

    List<AccountingVoucherDTO> getCashReceipts(Date fromDate, Date toDate);

    List<AccountingVoucherDTO> getCashPayments(Date fromDate, Date toDate);

    AccountingDashboardDTO getDashboard(Date fromDate, Date toDate);
}
