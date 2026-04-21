import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Result, Space, Spin, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import styles from './PaymentResult.module.scss';
import { OrderService } from '~/service/orderService';

const cx = classNames.bind(styles);

function PaymentResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [syncingStatus, setSyncingStatus] = useState(false);
    const [order, setOrder] = useState(null);

    const orderId = searchParams.get('vnp_TxnRef');
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');

    const isSuccess = responseCode === '00' && transactionStatus === '00';

    const fetchOrderStatus = useCallback(async () => {
        if (!orderId) {
            setLoading(false);
            setSyncingStatus(false);
            return false;
        }

        const orderService = new OrderService();
        const response = await orderService.viewById({ id: orderId });
        setOrder(response?.data || null);
        return response?.data?.paymentStatus === 'Đã thanh toán';
    }, [orderId]);

    useEffect(() => {
        let cancelled = false;
        let timerId;
        const maxRetry = 8;
        const retryDelay = 2000;

        const run = async (attempt = 0) => {
            try {
                if (attempt === 0) {
                    setLoading(true);
                }

                const isPaid = await fetchOrderStatus();
                if (cancelled) {
                    return;
                }

                const shouldRetry = isSuccess && !isPaid && attempt < maxRetry;
                setSyncingStatus(shouldRetry);

                if (shouldRetry) {
                    timerId = window.setTimeout(() => {
                        run(attempt + 1);
                    }, retryDelay);
                    return;
                }

                setLoading(false);
            } catch {
                if (cancelled) {
                    return;
                }

                setOrder(null);
                setSyncingStatus(false);
                setLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
    }, [fetchOrderStatus, isSuccess]);

    const paymentStatus = useMemo(() => {
        if (syncingStatus && isSuccess && order?.paymentStatus !== 'Đã thanh toán') {
            return 'Đang đồng bộ trạng thái thanh toán...';
        }

        if (order?.paymentStatus) {
            return order.paymentStatus;
        }
        return isSuccess ? 'Đã thanh toán' : 'Chưa thanh toán';
    }, [isSuccess, order, syncingStatus]);

    const subtitle = useMemo(() => {
        if (!isSuccess) {
            return 'Vui lòng kiểm tra lại giao dịch hoặc thử thanh toán lại.';
        }

        if (syncingStatus) {
            return 'VNPay đã trả về, hệ thống đang đồng bộ trạng thái đơn hàng. Vui lòng chờ trong giây lát.';
        }

        if (order?.paymentStatus === 'Đã thanh toán') {
            return 'Đơn hàng đã được ghi nhận thành công và đồng bộ với hệ thống.';
        }

        return 'Giao dịch đã trả về, hệ thống sẽ cập nhật trạng thái đơn hàng ngay khi đồng bộ hoàn tất.';
    }, [isSuccess, order, syncingStatus]);

    if (loading) {
        return (
            <div className={cx('container')}>
                <Spin size="large" />
            </div>
        );
    }

    if (!orderId) {
        return (
            <div className={cx('container')}>
                <Card className={cx('card')}>
                    <Alert
                        type="warning"
                        showIcon
                        message="Không có thông tin giao dịch"
                        description="Trang này dùng để nhận kết quả trả về từ VNPay sau khi thanh toán."
                    />
                    <Button type="primary" onClick={() => navigate('/cart')} className={cx('backBtn')}>
                        Quay lại giỏ hàng
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            <Card className={cx('card')}>
                <Result
                    status={isSuccess ? 'success' : 'error'}
                    icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    title={isSuccess ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay chưa thành công'}
                    subTitle={subtitle}
                />

                {syncingStatus && isSuccess ? (
                    <Alert
                        type="info"
                        showIcon
                        message="Đang cập nhật trạng thái đơn hàng"
                        description="VNPay đã phản hồi, hệ thống đang kiểm tra lại đơn hàng cho tới khi trạng thái thanh toán được cập nhật."
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Mã đơn hàng">{order?.sku || orderId}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">{paymentStatus}</Descriptions.Item>
                    <Descriptions.Item label="Mã phản hồi VNPay">{responseCode || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái giao dịch">{transactionStatus || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        {Number(order?.totalPrice || 0).toLocaleString('vi-VN')}đ
                    </Descriptions.Item>
                </Descriptions>

                <Space className={cx('actions')}>
                    <Button type="primary" onClick={() => navigate('/order')}>
                        Xem đơn hàng
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>
                </Space>
            </Card>
        </div>
    );
}

export default PaymentResult;