const { ServiceBase } = require('~/config/service-base');

export class StockIssueService extends ServiceBase {
    viewAll = async () => {
        return this.get('/stock-issue');
    };

    create = async (params) => {
        return this.post('/stock-issue', params);
    };
}
