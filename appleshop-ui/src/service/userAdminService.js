const { ServiceBase } = require('~/config/service-base');

export class UserAdminService extends ServiceBase {
    getAllUsers = async () => {
        return this.get('/user');
    };

    updateRoleBatch = async (updates) => {
        return this.put('/user/batch/role', updates);
    };
}
