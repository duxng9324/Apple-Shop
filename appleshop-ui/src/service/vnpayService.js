const { ServiceBase } = require('~/config/service-base');

export class VnpayService extends ServiceBase {
    createPaymentUrl = async (params) => {
        return this.post('/vnpay/create-payment-url', params);
    };

    verifyReturn = async (params) => {
        return this.get('/vnpay/return', params);
    };
}
