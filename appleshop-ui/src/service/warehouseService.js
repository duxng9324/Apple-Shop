const { ServiceBase } = require('~/config/service-base');

export class WarehouseService extends ServiceBase {
    viewAll = async () => {
        return this.get('/warehouse');
    };

    add = async (params) => {
        return this.post('/warehouse', params);
    };

    update = async (params) => {
        const { id } = params;
        return this.put(`/warehouse/${id}`, params);
    };

    remove = async (params) => {
        const { id } = params;
        return this.delete(`/warehouse/${id}`);
    };
}
