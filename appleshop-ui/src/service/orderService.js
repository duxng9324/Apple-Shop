const { ServiceBase } = require('~/config/service-base');

export class OrderService extends ServiceBase {
    view = async (params) => {
        const { userId } = params;
        return this.get(`/order/user/${userId}`);
    };
    add = async (params) => {
        return this.post(`/order`, params);
    };
    viewAll = async () => {
        return this.get(`/order`);
    };
    changeStatus = async (params) => {
        const { id, strategy } = params;
        const query = strategy ? `?strategy=${encodeURIComponent(strategy)}` : '';
        return this.put(`/order/confirm/${id}${query}`, params);
    };

    markPaid = async (params) => {
        const { id } = params;
        return this.put(`/order/payment/${id}`);
    };

    changeCheckOrder = async (params) => {
        const { orderId } = params;
        return this.put(`/order/change/${orderId}`);
    };
}
