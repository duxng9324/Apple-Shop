import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Result, Space, Spin, Table, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import styles from './PaymentResult.module.scss';
import { OrderService } from '~/service/orderService';
import { VnpayService } from '~/service/vnpayService';

const { Title } = Typography;
const cx = classNames.bind(styles);

function PaymentResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [syncingStatus, setSyncingStatus] = useState(false);
    const [order, setOrder] = useState(null);
    const [signatureValid, setSignatureValid] = useState(true);
    const [verifiedResponse, setVerifiedResponse] = useState(null);
    const signatureValidRef = useRef(true);

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

        const verifyReturn = async () => {
            if (!orderId) {
                return { validSignature: true };
            }

            const params = Object.fromEntries(searchParams.entries());
            const vnpayService = new VnpayService();
            return vnpayService.verifyReturn(params);
        };

        const run = async (attempt = 0) => {
            try {
                let isCurrentSignatureValid = signatureValidRef.current;
                if (attempt === 0) {
                    setLoading(true);
                    const verifyResponse = await verifyReturn();
                    if (cancelled) {
                        return;
                    }
                    setVerifiedResponse(verifyResponse || null);
                    isCurrentSignatureValid = Boolean(verifyResponse?.validSignature ?? true);
                    signatureValidRef.current = isCurrentSignatureValid;
                    setSignatureValid(isCurrentSignatureValid);
                }

                const isPaid = await fetchOrderStatus();
                if (cancelled) {
                    return;
                }

                const shouldRetry = isSuccess && isCurrentSignatureValid && !isPaid && attempt < maxRetry;
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
    }, [fetchOrderStatus, isSuccess, orderId, searchParams]);

    const paymentStatus = useMemo(() => {
        if (!signatureValid) {
            return 'Chữ ký không hợp lệ';
        }

        if (syncingStatus && isSuccess && order?.paymentStatus !== 'Đã thanh toán') {
            return 'Đang đồng bộ trạng thái thanh toán...';
        }

        if (order?.paymentStatus) {
            return order.paymentStatus;
        }
        return isSuccess ? 'Đã thanh toán' : 'Chưa thanh toán';
    }, [isSuccess, order, signatureValid, syncingStatus]);

    const subtitle = useMemo(() => {
        if (!signatureValid) {
            return 'VNPay đã trả về nhưng chữ ký bảo mật không hợp lệ, hệ thống không xác nhận thanh toán.';
        }

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
    }, [isSuccess, order, signatureValid, syncingStatus]);

    if (loading) {
        return (
            <div className={cx('container')}>
                <Spin size="large" />
            </div>
        );
    }

    const displayOrder = order || verifiedResponse?.order;

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
                    status={isSuccess && signatureValid ? 'success' : 'error'}
                    icon={isSuccess && signatureValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    title={isSuccess && signatureValid ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay chưa thành công'}
                    subTitle={subtitle}
                />

                {syncingStatus && isSuccess && signatureValid ? (
                    <Alert
                        type="info"
                        showIcon
                        message="Đang cập nhật trạng thái đơn hàng"
                        description="VNPay đã phản hồi, hệ thống đang kiểm tra lại đơn hàng cho tới khi trạng thái thanh toán được cập nhật."
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                {!signatureValid ? (
                    <Alert
                        type="error"
                        showIcon
                        message="Xác thực phản hồi VNPay thất bại"
                        description={verifiedResponse?.message || 'Không thể xác minh chữ ký bảo mật từ dữ liệu trả về.'}
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                <Descriptions bordered column={1} size="middle" style={{ textAlign: 'left' }}>
                    <Descriptions.Item label="Mã đơn hàng">{displayOrder?.sku || orderId}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đơn hàng">{displayOrder?.status || 'Chờ cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">{paymentStatus}</Descriptions.Item>
                    <Descriptions.Item label="Mã phản hồi VNPay">{responseCode || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái giao dịch">{transactionStatus || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Xác thực chữ ký">{signatureValid ? 'Hợp lệ' : 'Không hợp lệ'}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        {Number(displayOrder?.totalPrice || (Number(searchParams.get('vnp_Amount') || 0) / 100)).toLocaleString('vi-VN')}đ
                    </Descriptions.Item>
                </Descriptions>

                {displayOrder && (
                    <div style={{ marginTop: 24, textAlign: 'left' }}>
                        <Title level={5}>Thông tin khách hàng</Title>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Họ tên">{displayOrder.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Điện thoại">{displayOrder.orderPhone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{displayOrder.email}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{displayOrder.orderAddress}</Descriptions.Item>
                        </Descriptions>

                        <Title level={5}>Sản phẩm đã mua</Title>
                        <Table 
                            dataSource={displayOrder.orderItemDTOs || []} 
                            rowKey="id" 
                            pagination={false} 
                            size="small"
                            bordered
                            columns={[
                                { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
                                { title: 'Màu/Dung lượng', key: 'variant', render: (_, record) => `${record.color || ''} ${record.memory || ''}`.trim() },
                                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 100, align: 'center' },
                                { title: 'Đơn giá', dataIndex: 'price', key: 'price', align: 'right', render: (val) => `${Number(val || 0).toLocaleString('vi-VN')}đ` }
                            ]}
                        />
                    </div>
                )}

                <Space className={cx('actions')} style={{ marginTop: 24 }}>
                    <Button type="primary" onClick={() => navigate('/order')}>
                        Xem đơn hàng
                    </Button>
                    <Button onClick={() => navigate('/')}>Về trang chủ</Button>
                </Space>
            </Card>
        </div>
    );
}

export default PaymentResult;
