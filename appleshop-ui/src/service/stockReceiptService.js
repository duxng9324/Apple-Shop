const { ServiceBase } = require('~/config/service-base');

export class StockReceiptService extends ServiceBase {
    viewAll = async () => {
        return this.get('/stock-receipt');
    };

    create = async (params) => {
        return this.post('/stock-receipt', params);
    };
}
