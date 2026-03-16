import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

import { Card, List, Button, Form, Input, Select, Radio, Row, Col, Divider, Empty, Typography, Space } from 'antd';

import { CartService } from '~/service/cartService';
import { OrderService } from '~/service/orderService';
import ProductCartItem from '~/components/ProductCartItem';
import data from '~/data/data.json';

const { Title, Text } = Typography;

function Cart() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [province, setProvince] = useState();
    const [district, setDistrict] = useState();

    const token = localStorage.getItem('token');
    const decode = token ? jwt_decode(token) : null;
    const userId = decode?.id;

    const cartService = new CartService();
    const orderService = new OrderService();

    /* ---------------- FETCH CART ---------------- */

    const fetchCart = async () => {
        const res = await cartService.view({ userId });
        setItems(res);
    };

    useEffect(() => {
        if (userId) fetchCart();
    }, [userId]);

    /* ---------------- TOTAL PRICE ---------------- */

    const priceAll = useMemo(() => {
        return items.reduce((sum, item) => {
            const { productDTO, memory, quantity } = item;

            const price = productDTO.list.find((i) => i.type === memory).price;

            return sum + price * quantity;
        }, 0);
    }, [items]);

    /* ---------------- UPDATE ITEM ---------------- */

    const updateItem = (index, quantity, color) => {
        const copy = [...items];

        copy[index].quantity = quantity;
        copy[index].color = color;

        setItems(copy);
    };

    /* ---------------- ORDER ---------------- */

    const onOrder = async (values) => {
        const orderItemDTOs = items.map((item) => {
            const { productDTO, memory, color, quantity } = item;

            return {
                image: productDTO.imgLinks[0],
                name: productDTO.name,
                quantity,
                price: productDTO.list.find((i) => i.type === memory).price,
                memory,
                color,
            };
        });

        const params = {
            fullName: values.fullName,
            sex: values.sex,
            orderPhone: values.orderPhone,
            email: values.email,
            orderAddress: values.myhome + ', ' + values.ward + ', ' + values.district + ', ' + values.province,
            totalPrice: priceAll,
            userId,
            orderItemDTOs,
        };

        await orderService.add(params);
        await cartService.removeAll(userId);

        setItems([]);

        navigate('/order', { state: true });
    };

    /* ---------------- EMPTY CART ---------------- */

    if (items.length === 0) {
        return <Empty description="Giỏ hàng trống" />;
    }

    return (
        <div style={{ maxWidth: 1200, margin: 'auto' }}>
            <Title level={3}>Giỏ hàng ({items.length} sản phẩm)</Title>

            {/* PRODUCT LIST */}

            <Card>
                <List
                    dataSource={items}
                    renderItem={(item, index) => (
                        <ProductCartItem
                            key={item.id}
                            item={item}
                            index={index}
                            onChange={updateItem}
                            onRemove={fetchCart}
                        />
                    )}
                />
            </Card>

            {/* PRICE */}

            <Card style={{ marginTop: 20 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Row justify="space-between">
                        <Text>Tổng tiền</Text>
                        <Text>{(priceAll * 1.2).toLocaleString()}đ</Text>
                    </Row>

                    <Row justify="space-between">
                        <Text>Giảm</Text>
                        <Text>-{(priceAll * 0.2).toLocaleString()}đ</Text>
                    </Row>

                    <Divider />

                    <Row justify="space-between">
                        <Title level={4}>Thanh toán</Title>
                        <Title level={4} style={{ color: '#ff4d4f' }}>
                            {priceAll.toLocaleString()}đ
                        </Title>
                    </Row>
                </Space>
            </Card>

            {/* ORDER FORM */}

            <Card title="Thông tin đặt hàng" style={{ marginTop: 20 }}>
                <Form layout="vertical" onFinish={onOrder}>
                    <Form.Item name="sex" label="Giới tính" rules={[{ required: true, message: 'Chọn giới tính' }]}>
                        <Radio.Group>
                            <Radio value="male">Nam</Radio>
                            <Radio value="female">Nữ</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                                <Input placeholder="Nhập họ tên" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="orderPhone" label="Số điện thoại" rules={[{ required: true }]}>
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    {/* ADDRESS */}

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="province" label="Tỉnh" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Chọn tỉnh"
                                    onChange={(v) => {
                                        setProvince(v);
                                        setDistrict(null);
                                    }}
                                >
                                    {data.map((p) => (
                                        <Select.Option key={p.name} value={p.name}>
                                            {p.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="district" label="Quận" rules={[{ required: true }]}>
                                <Select placeholder="Chọn quận" onChange={setDistrict}>
                                    {province &&
                                        data
                                            .find((p) => p.name === province)
                                            ?.huyen.map((d) => (
                                                <Select.Option key={d.name} value={d.name}>
                                                    {d.name}
                                                </Select.Option>
                                            ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="ward" label="Phường" rules={[{ required: true }]}>
                                <Select placeholder="Chọn phường">
                                    {district &&
                                        data
                                            .find((p) => p.name === province)
                                            ?.huyen.find((d) => d.name === district)
                                            ?.xa.map((w) => (
                                                <Select.Option key={w.name} value={w.name}>
                                                    {w.name}
                                                </Select.Option>
                                            ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="myhome" label="Địa chỉ cụ thể" rules={[{ required: true }]}>
                        <Input placeholder="Số nhà, đường..." />
                    </Form.Item>

                    <Button type="primary" size="large" block htmlType="submit">
                        Hoàn tất đặt hàng
                    </Button>
                </Form>
            </Card>
        </div>
    );
}

export default Cart;
