const { ServiceBase } = require('~/config/service-base');

export class ProductService extends ServiceBase {
    view = async () => {
        return this.get('/product');
    };
    edit = async (params) => {
        const { id, name, code, description, categoryCode, list, colors, imgLinks } = params;
        return this.put(`/product/${id}`, { name, code, description, categoryCode, list, colors, imgLinks });
    };
    remove = async (params) => {
        const id = params.id;
        return this.delete(`/product/${id}`);
    };
    add = async (params) => {
        const { name, code, description, categoryCode, list, colors, imgLinks } = params;
        return this.post(`/product`, { name, code, description, categoryCode, list, colors, imgLinks });
    };
    viewProductByCate = async (params) => {
        const { device } = params;
        return this.get(`/product/${device}`);
    };
    viewProductByCode = async (params) => {
        const { productCode } = params;
        const code = productCode;
        console.log(code);
        return this.get('/product/code', { code });
    };
}
