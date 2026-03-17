const { ServiceBase } = require('~/config/service-base');

export class ImageService extends ServiceBase {
    uploadProductImages = async (files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });
        return this.axiosInstance.post('/image/product', formData, {
            timeout: 120000,
        });
    };
}
