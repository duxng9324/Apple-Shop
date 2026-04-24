import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Alert, Button, Card, Col, Divider, Row, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, PayCircleOutlined } from '@ant-design/icons';
import styles from './Payment.module.scss';
import { VnpayService } from '~/service/vnpayService';

const cx = classNames.bind(styles);

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkoutData = location.state?.checkoutData;
    const paymentPayload = checkoutData
        ? {
              ...checkoutData,
              paymentMethod: 'VNPAY_QR',
          }
        : null;

    const handleConfirmPaid = async () => {
        if (!paymentPayload) return;

        const vnpayService = new VnpayService();

        try {
            setIsSubmitting(true);
            const returnUrl = `${window.location.origin}/payment-result`;
            const response = await vnpayService.createPaymentUrl({
                order: paymentPayload,
                returnUrl,
            });

            if (!response?.paymentUrl) {
                throw new Error('Không thể tạo đường dẫn thanh toán VNPay');
            }

            window.location.assign(response.paymentUrl);
        } catch {
            message.error('Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại.');
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
                            <PayCircleOutlined />
                            <Typography.Title level={4}>Thanh toán VNPay Sandbox</Typography.Title>
                        </Space>

                        <Typography.Paragraph>
                            Hệ thống sẽ tạo đơn hàng trước, sau đó chuyển thẳng sang cổng thanh toán VNPay sandbox để bạn
                            hoàn tất giao dịch.
                        </Typography.Paragraph>

                        <Alert
                            type="info"
                            showIcon
                            message="Môi trường thử nghiệm"
                            description="Bạn sẽ được chuyển đến trang test của VNPAY với thông tin Sandbox đã cung cấp."
                        />
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
                                Thanh toán với VNPay
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
