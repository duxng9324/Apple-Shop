import axios from 'axios';
import { message } from 'antd';

export class HttpClient {
    axiosInstance;
    constructor() {
        let configs = {
            baseURL: 'http://localhost:8081/api/',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                // Authorization: "Bearer " + tokenAccess,
            },
            timeout: 5000,
            transformRequest: [
                (data, headers) => {
                    if (data instanceof FormData) {
                        if (headers) {
                            delete headers['Content-Type'];
                        }
                        return data;
                    }
                    return JSON.stringify(data);
                },
            ],
        };
        this.axiosInstance = axios.create(configs);
        this.axiosInstance.interceptors.request.use(
            // function (config) {
            //     return config;
            // },
            function (config) {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `${token}`;
                }
                return config;
            },
            function (error) {
                return Promise.reject(error);
            },
        );
        this.axiosInstance.interceptors.response.use(
            function (response) {
                const data = response.data;

                return data;
            },
            function (error) {
                if (!error.response) {
                    const networkError = new Error('Network error');
                    networkError.userMessage = 'Lỗi kết nối mạng. Vui lòng thử lại.';
                    message.error(networkError.userMessage);
                    return Promise.reject(networkError);
                }

                const status = error.response.status;
                const data = error.response.data;
                const apiMessage = typeof data === 'string' ? data : data?.message;
                let normalizedMessage = apiMessage || 'Có lỗi xảy ra. Vui lòng thử lại.';

                if (status === 401) {
                    normalizedMessage = apiMessage || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                    message.error(normalizedMessage);
                    window.location.href = '/login';
                } else if (status === 403) {
                    normalizedMessage = apiMessage || 'Truy cập bị từ chối';
                    message.error(normalizedMessage);
                } else if (status === 404) {
                    normalizedMessage = apiMessage || 'Không tìm thấy dữ liệu yêu cầu';
                    message.error(normalizedMessage);
                } else if (status === 409) {
                    normalizedMessage = apiMessage || 'Dữ liệu đã thay đổi bởi người dùng khác. Vui lòng thử lại.';
                    message.warning(normalizedMessage);
                } else if (status >= 400) {
                    message.error(normalizedMessage);
                }

                error.userMessage = normalizedMessage;

                return Promise.reject(error);
            },
        );
    }
}
