const { ServiceBase } = require('~/config/service-base');

export class CategoryService extends ServiceBase {
    view = async () => {
        return this.get('/category');
    };
    edit = async (params) => {
        const { id, name, code } = params;
        return this.put(`/category/${id}`, { name, code });
    };
    remove = async (params) => {
        const id = params.id;
        return this.delete(`/category/${id}`);
    };
    add = async (params) => {
        const { name, code } = params;
        return this.post(`/category`, { name, code });
    };
    viewWithCategory = async (params) => {
        const {category} = params;
        return this.get(`/category/${category}`)
    }
}
