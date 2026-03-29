import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Alert, Button, Card, Col, Divider, Row, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, QrcodeOutlined } from '@ant-design/icons';
import styles from './Payment.module.scss';
import { OrderService } from '~/service/orderService';
import { CartService } from '~/service/cartService';

const cx = classNames.bind(styles);

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkoutData = location.state?.checkoutData;

    const paymentPayload = useMemo(() => {
        if (!checkoutData) return null;

        return {
            ...checkoutData,
            paymentMethod: 'VNPAY_QR',
        };
    }, [checkoutData]);

    const orderCode = useMemo(() => {
        return `AS-${Date.now()}`;
    }, []);

    const qrContent = useMemo(() => {
        if (!paymentPayload) return '';

        const amount = Number(paymentPayload.totalPrice || 0);
        const text = `VNPAY|APPLESHOP|${orderCode}|${amount}|${paymentPayload.fullName || ''}`;
        return encodeURIComponent(text);
    }, [paymentPayload, orderCode]);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrContent}`;

    const handleConfirmPaid = async () => {
        if (!paymentPayload) return;

        const orderService = new OrderService();
        const cartService = new CartService();

        try {
            setIsSubmitting(true);
            const normalizedPayload = {
                ...paymentPayload,
                orderItemDTOs: (paymentPayload.orderItemDTOs || []).map((item) => ({
                    ...item,
                    productId: item.productId,
                    productCode: item.productCode,
                })),
            };

            await orderService.add(normalizedPayload);
            await cartService.removeAll(paymentPayload.userId);
            message.success('Xác nhận thanh toán thành công, đơn hàng đã được tạo.');
            navigate('/order', { state: true });
        } catch {
            message.error('Không thể tạo đơn hàng sau thanh toán. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!paymentPayload) {
        return (
            <div className={cx('container')}>
                <Alert
                    type="warning"
                    showIcon
                    message="Không có dữ liệu thanh toán"
                    description="Vui lòng quay lại giỏ hàng và chọn VNPay QR để tiếp tục."
                    action={
                        <Button type="primary" onClick={() => navigate('/cart')}>
                            Về giỏ hàng
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className={cx('container')}>
            <Button className={cx('backBtn')} type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')}>
                Quay lại giỏ hàng
            </Button>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card className={cx('card')}>
                        <Space align="center" size={8} className={cx('titleWrap')}>
                            <QrcodeOutlined />
                            <Typography.Title level={4}>Thanh toán VNPay qua QR</Typography.Title>
                        </Space>

                        <Typography.Paragraph>
                            Quét mã QR bên dưới bằng ứng dụng ngân hàng hoặc ví có hỗ trợ VNPay để hoàn tất thanh toán.
                        </Typography.Paragraph>

                        <div className={cx('qrWrap')}>
                            <img src={qrUrl} alt="QR thanh toán VNPay" className={cx('qrImage')} />
                        </div>

                        <Typography.Text type="secondary">Nội dung chuyển khoản: {orderCode}</Typography.Text>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card className={cx('card')}>
                        <Typography.Title level={5}>Thông tin thanh toán</Typography.Title>
                        <div className={cx('line')}>
                            <span>Người thanh toán</span>
                            <strong>{paymentPayload.fullName}</strong>
                        </div>
                        <div className={cx('line')}>
                            <span>Số điện thoại</span>
                            <strong>{paymentPayload.orderPhone}</strong>
                        </div>
                        <div className={cx('line')}>
                            <span>Địa chỉ nhận hàng</span>
                            <strong className={cx('address')}>{paymentPayload.orderAddress}</strong>
                        </div>
                        <Divider />
                        <div className={cx('line')}>
                            <span>Tổng thanh toán</span>
                            <strong className={cx('totalPrice')}>
                                {Number(paymentPayload.totalPrice || 0).toLocaleString('vi-VN')}đ
                            </strong>
                        </div>

                        <div className={cx('actionWrap')}>
                            <Button type="primary" size="large" loading={isSubmitting} onClick={handleConfirmPaid}>
                                Tôi đã thanh toán
                            </Button>
                            <Button size="large" onClick={() => navigate('/cart')}>
                                Đổi phương thức thanh toán
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Payment;
