import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import data from '~/data/data.json';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftOutlined, CreditCardOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import jwt_decode from 'jwt-decode';
import { CartService } from '~/service/cartService';
import ProductCartItem from '~/components/ProductCartItem';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { OrderService } from '~/service/orderService';
import { Alert, Button, Card, Col, Divider, Empty, Input, Radio, Row, Select, Space, Typography } from 'antd';

const cx = classNames.bind(styles);

function Cart() {
    const { Text } = Typography;

    const navigate = useNavigate();
    const [checkRemove, setCheckRemove] = useState(false);

    const token = localStorage.getItem('token');
    const userId = useMemo(() => {
        if (!token) return null;
        try {
            const decode = jwt_decode(token);
            return decode?.id ?? null;
        } catch {
            return null;
        }
    }, [token]);
    const [items, setItems] = useState([]);

    const onRemove = () => {
        setCheckRemove(!checkRemove);
    };

    const cartService = new CartService();
    useEffect(() => {
        if (!userId) {
            setItems([]);
            return;
        }

        const fetchData = async function () {
            try {
                const res = await cartService.view({ userId });
                setItems(res || []);
                return res;
            } catch {
                setItems([]);
            }
        };

        fetchData();
    }, [checkRemove, userId]);

    const priceAll = useMemo(() => {
        let sum = 0;
        items &&
            items.map((item) => {
                const { productDTO, memory, quantity } = item;
                const price = productDTO.list.find((item) => item.type === memory).price;
                return (sum += price * quantity);
            });
        return sum;
    }, [items]);
    const ChangeItemsList = (index, quantity, color) => {
        let copyItems = JSON.parse(JSON.stringify(items));
        copyItems[index]['quantity'] = quantity;
        copyItems[index]['color'] = color;
        setItems(copyItems);
    };
    const schema = yup.object().shape({
        sex: yup.string().required('Hãy chọn giới tính của bạn'),
        paymentMethod: yup.string().required('Hãy chọn phương thức thanh toán'),
        fullName: yup.string().required('Hãy nhập tên của bạn'),
        orderPhone: yup.string().required('Hãy nhập số điện thoại của bạn'),
        email: yup.string().required('Hãy nhập email của bạn'),
        province: yup.string().required('Hãy chọn tỉnh thành của bạn'),
        district: yup.string().required('Hãy chọn quận huyện của bạn'),
        ward: yup.string().required('Hãy chọn đầy đủ xã phường của bạn'),
        myhome: yup.string().required('Hãy nhập địa chỉ cụ thể nhà của bạn'),
    });
    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            sex: '',
            paymentMethod: '',
            fullName: '',
            orderPhone: '',
            email: '',
            province: '',
            district: '',
            ward: '',
            myhome: '',
        },
    });

    const province = watch('province');
    const district = watch('district');

    const orderService = new OrderService();
    const onOrder = async (formData) => {
        const orderItemDTOs = [];
        items.forEach((item) => {
            const { productDTO, memory, color, quantity } = item;
            const orderItem = {
                image: productDTO.imgLinks[0],
                name: productDTO.name,
                quantity: quantity,
                price: productDTO.list.find((item) => item.type === memory).price,
                memory: memory,
                color: color,
            };
            orderItemDTOs.push(orderItem);
        });
        const params = {
            fullName: formData.fullName,
            sex: formData.sex,
            paymentMethod: formData.paymentMethod,
            orderPhone: formData.orderPhone,
            email: formData.email,
            orderAddress: formData.myhome + ', ' + formData.ward + ', ' + formData.district + ', ' + formData.province,
            totalPrice: priceAll,
            userId: userId,
            orderItemDTOs: orderItemDTOs,
        };

        if (formData.paymentMethod === 'VNPAY_QR') {
            navigate('/payment', {
                state: {
                    checkoutData: params,
                },
            });
            return;
        }

        try {
            await orderService.add(params);
            await cartService.removeAll(userId);
            setItems([]);
            navigate('/order', { state: true });
        } catch {}
    };

    const provinceOptions = data.map((item) => ({ value: item.name, label: item.name }));
    const districtOptions =
        province && data.find((item) => item.name === province)
            ? data.find((item) => item.name === province).huyen.map((item) => ({ value: item.name, label: item.name }))
            : [];
    const wardOptions =
        district && province
            ? data
                  .find((item) => item.name === province)
                  ?.huyen.find((item) => item.name === district)
                  ?.xa.map((item) => ({ value: item.name, label: item.name })) || []
            : [];

    return (
        <div className={cx('container', 'cartPage')}>
            <div className={cx('return', 'backLink')}>
                <ArrowLeftOutlined />
                <Link to="/">Tiếp tục mua hàng</Link>
            </div>
            {!userId && (
                <Alert
                    className={cx('authNotice')}
                    message="Bạn chưa đăng nhập"
                    description="Vui lòng đăng nhập để xem giỏ hàng và tiến hành đặt hàng."
                    type="warning"
                    showIcon
                />
            )}
            {userId && items.length === 0 && (
                <Card className={cx('emptyCard')}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text>Chưa có sản phẩm nào trong giỏ hàng</Text>}
                    />
                </Card>
            )}
            {userId && items.length > 0 && (
                <Row gutter={[24, 24]} align="top">
                    <Col xs={24} xl={16}>
                        <Card
                            className={cx('cartCard')}
                            title={
                                <Space size={8}>
                                    <ShoppingCartOutlined />
                                    <Text strong>Có {items.length} sản phẩm trong giỏ hàng</Text>
                                </Space>
                            }
                        >
                            <div className={cx('product-list')}>
                                {items &&
                                    items.map((item, index) => {
                                        return (
                                            <ProductCartItem
                                                props={item}
                                                key={index}
                                                setItems={ChangeItemsList}
                                                index={index}
                                                id={item.id}
                                                onRemove={onRemove}
                                            />
                                        );
                                    })}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} xl={8}>
                        <Card className={cx('summaryCard')}>
                            <div className={cx('totalprice', 'summaryRows')}>
                                <div className={cx('totalprice-row')}>
                                    <span>Tổng tiền</span>
                                    <span>{(priceAll * 1.2).toLocaleString('vi-VN') + 'đ'}</span>
                                </div>
                                <div className={cx('totalprice-row')}>
                                    <span>Giảm</span>
                                    <span>-{(priceAll * 0.2).toLocaleString('vi-VN') + 'đ'}</span>
                                </div>
                                <Divider style={{ margin: '10px 0' }} />
                                <div className={cx('totalprice-row')}>
                                    <strong>Cần thanh toán</strong>
                                    <span className={cx('text-price-l')}>{priceAll.toLocaleString('vi-VN') + 'đ'}</span>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            className={cx('formCard')}
                            title={
                                <Space size={8}>
                                    <CreditCardOutlined />
                                    <Text strong>Thông tin đặt hàng</Text>
                                </Space>
                            }
                        >
                            <form onSubmit={handleSubmit(onOrder)}>
                                <div className={cx('formStack')}>
                                    <div>
                                        <div className={cx('fieldLabel')}>Giới tính</div>
                                        <Controller
                                            name="sex"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Radio.Group {...field}>
                                                        <Radio value="male">Nam</Radio>
                                                        <Radio value="female">Nữ</Radio>
                                                    </Radio.Group>
                                                </div>
                                            )}
                                        />
                                        <p className={cx('errors')}>{errors.sex?.message}</p>
                                    </div>

                                    <div>
                                        <Text className={cx('fieldLabel')}>Phương thức thanh toán</Text>
                                        <Controller
                                            name="paymentMethod"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Radio.Group {...field}>
                                                        <Space direction="vertical">
                                                            <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                                                            <Radio value="VNPAY_QR">VNPay QR</Radio>
                                                        </Space>
                                                    </Radio.Group>
                                                </div>
                                            )}
                                        />
                                        <p className={cx('errors')}>{errors.paymentMethod?.message}</p>
                                    </div>

                                    <div>
                                        <Controller
                                            name="fullName"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} size="large" placeholder="Nhập họ và tên" />
                                            )}
                                        />
                                        <p className={cx('errors')}>{errors.fullName?.message}</p>
                                    </div>

                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} md={12}>
                                            <Controller
                                                name="orderPhone"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} size="large" placeholder="Nhập số điện thoại" />
                                                )}
                                            />
                                            <p className={cx('errors')}>{errors.orderPhone?.message}</p>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Controller
                                                name="email"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} size="large" placeholder="Nhập email" />
                                                )}
                                            />
                                            <p className={cx('errors')}>{errors.email?.message}</p>
                                        </Col>
                                    </Row>

                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} md={8}>
                                            <Controller
                                                name="province"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        size="large"
                                                        className={cx('fullWidth')}
                                                        options={provinceOptions}
                                                        placeholder="Tỉnh / thành"
                                                        value={field.value || undefined}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            setValue('district', '');
                                                            setValue('ward', '');
                                                        }}
                                                    />
                                                )}
                                            />
                                            <p className={cx('errors')}>{errors.province?.message}</p>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Controller
                                                name="district"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        size="large"
                                                        className={cx('fullWidth')}
                                                        options={districtOptions}
                                                        placeholder="Quận / huyện"
                                                        value={field.value || undefined}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            setValue('ward', '');
                                                        }}
                                                        disabled={!province}
                                                    />
                                                )}
                                            />
                                            <p className={cx('errors')}>{errors.district?.message}</p>
                                        </Col>
                                        <Col xs={24} md={8}>
                                            <Controller
                                                name="ward"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        size="large"
                                                        className={cx('fullWidth')}
                                                        options={wardOptions}
                                                        placeholder="Xã / phường"
                                                        value={field.value || undefined}
                                                        onChange={field.onChange}
                                                        disabled={!district}
                                                    />
                                                )}
                                            />
                                            <p className={cx('errors')}>{errors.ward?.message}</p>
                                        </Col>
                                    </Row>

                                    <div>
                                        <Controller
                                            name="myhome"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} size="large" placeholder="Nhập địa chỉ nhà của bạn" />
                                            )}
                                        />
                                        <p className={cx('errors')}>{errors.myhome?.message}</p>
                                    </div>

                                    <div className={cx('footer', 'orderFooter')}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            className={cx('btn-order')}
                                        >
                                            Hoàn tất đặt hàng
                                        </Button>
                                        <div className={cx('confirm')}>
                                            <p>
                                                Bằng cách đặt hàng, bạn đồng ý với <i>Điều khoản sử dụng</i> của chúng
                                                tôi
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
}

export default Cart;
