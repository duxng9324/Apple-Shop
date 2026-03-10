const { ServiceBase } = require('~/config/service-base');

export class ProductDetailService extends ServiceBase {
    view = async () => {
        return this.get('/product/detail');
    };
    edit = async (params) => {
        const { id, memory, price, priceBrick, productCode } = params;
        return this.put(`/product/detail/${id}`, { memory, price, priceBrick, productCode });
    };
    remove = async (params) => {
        const id = params.id;
        return this.delete(`/product/detail/${id}`);
    };
    add = async (params) => {
        const { memory, price, priceBrick, productCode } = params;
        return this.post(`/product/detail`, { memory, price, priceBrick, productCode });
    };
}
