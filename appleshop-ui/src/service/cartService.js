const { ServiceBase } = require('~/config/service-base');

export class CartService extends ServiceBase {
    view = async (params) => {
        const { userId } = params;
        return this.get(`/cart/user/${userId}`);
    };
    remove = async (params) => {
        const id = params;
        return this.delete(`/cart/${id}`);
    };
    add = async (params) => {
        const { userId, productId, memory, color } = params;
        return this.post(`/cart`, { userId, productId, memory, color });
    };
    removeAll = async (params) => {
        const id = params;
        return this.delete(`/cart/user/${id}`);
    };
}
