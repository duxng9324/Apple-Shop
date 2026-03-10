const { ServiceBase } = require('~/config/service-base');

export class MemoryService extends ServiceBase {
    view = async () => {
        return this.get('/memory');
    };
    edit = async (params) => {
        const { id, type } = params;
        return this.put(`/memory/${id}`, { type });
    };
    remove = async (params) => {
        const id = params.id;
        return this.delete(`/memory/${id}`);
    };
    add = async (params) => {
        const { type } = params;
        return this.post(`/memory`, { type });
    };
}
