import { useState, useEffect } from 'react';
import { Card, Row, Col, Image, InputNumber, Select, Button, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { CartService } from '~/service/cartService';

function ProductCartItem({ item, index, onChange, onRemove }) {
    const { productDTO, color, quantity, memory, id } = item;

    const { imgLinks, list, colorDTOs } = productDTO;

    const price = list.find((i) => i.type === memory).price;

    const [qty, setQty] = useState(quantity);
    const [colorSelect, setColorSelect] = useState(color);

    const cartService = new CartService();

    useEffect(() => {
        onChange(index, qty, colorSelect);
    }, [qty, colorSelect]);

    const removeItem = async () => {
        await cartService.remove(id);
        onRemove();
    };

    return (
        <Card style={{ marginBottom: 12 }}>
            <Row align="middle" gutter={16}>
                <Col span={4}>
                    <Image src={imgLinks[0]} width={80} />
                </Col>

                <Col span={8}>
                    <div>
                        <strong>{productDTO.name}</strong>
                        <div>{memory}</div>
                    </div>
                </Col>

                <Col span={4}>
                    <Select value={colorSelect} style={{ width: '100%' }} onChange={setColorSelect}>
                        {colorDTOs.map((c) => (
                            <Select.Option key={c.color} value={c.color}>
                                {c.color}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>

                <Col span={4}>
                    <InputNumber min={1} value={qty} onChange={setQty} />
                </Col>

                <Col span={3}>{(qty * price).toLocaleString()}đ</Col>

                <Col span={1}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={removeItem} />
                </Col>
            </Row>
        </Card>
    );
}

export default ProductCartItem;
