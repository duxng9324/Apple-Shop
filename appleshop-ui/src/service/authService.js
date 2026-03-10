const { ServiceBase } = require('~/config/service-base');

export class AuthService extends ServiceBase {
    register = async (params) => {
        const { fullName, userName, password } = params;
        return this.post('signup', { fullName, userName, password });
    };
    register2 = async (params) => {
        const { userName, password } = params;
        return this.post('login', { userName, password });
    };

    view = async (params) => {
        const { userId } = params;
        return this.get(`/user/${userId}`);
    };

    remove = async (params) => {
        const { userId } = params;
        return this.delete(`/user/${userId}`);
    };
    changePass = async (params) => {
        const { userName, password, newPass } = params;
        return this.put('/changepass', { userName, password, newPass });
    };
    changeInfo = async (params) => {
        const { userId, userName, fullName, phone, email, address } = params;
        return this.put(`/user/${userId}`, { userName, fullName, phone, email, address });
    };
}
