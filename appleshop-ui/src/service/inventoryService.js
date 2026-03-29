const { ServiceBase } = require('~/config/service-base');

export class InventoryService extends ServiceBase {
    viewAll = async () => {
        return this.get('/inventory');
    };

    viewByWarehouse = async (params) => {
        const { warehouseId } = params;
        return this.get(`/inventory/warehouse/${warehouseId}`);
    };

    adjust = async (params) => {
        return this.post('/inventory/adjust', params);
    };
}
