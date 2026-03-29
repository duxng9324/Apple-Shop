const { ServiceBase } = require('~/config/service-base');

export class AccountingService extends ServiceBase {
    getReport = async (params) => {
        const { from, to } = params;
        return this.get('/accounting/report', { from, to });
    };

    getChartOfAccounts = async () => {
        return this.get('/accounting/coa');
    };

    getJournal = async (params) => {
        const { from, to } = params || {};
        return this.get('/accounting/journal', { from, to });
    };

    getReceivableAging = async (params) => {
        const { asOf } = params || {};
        return this.get('/accounting/ar-aging', { asOf });
    };

    getPayableAging = async (params) => {
        const { asOf } = params || {};
        return this.get('/accounting/ap-aging', { asOf });
    };

    getReconciliationSummary = async () => {
        return this.get('/accounting/reconciliation');
    };
}
