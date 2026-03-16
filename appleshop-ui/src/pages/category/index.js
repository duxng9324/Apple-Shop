import { Row, Col, Select, Typography, Space, Spin } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useEffect, useState, useMemo } from 'react';
import ProductItem from '~/components/ProductItem';
import { ProductService } from '~/service/productService';

const { Title } = Typography;

function Category({ title }) {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('default');
    const [loading, setLoading] = useState(false);

    const deviceMap = {
        iPhone: 'iphone',
        iPad: 'ipad',
        MAC: 'macbook',
        'Apple Watch': 'applewatch',
        'Phụ kiện': 'phu-kien',
    };

    const device = deviceMap[title];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const productService = new ProductService();
            const res = await productService.viewProductByCate({ device });
            setProducts(res || []);
            setLoading(false);
        };

        fetchProducts();
    }, [device]);

    const sortedProducts = useMemo(() => {
        const arr = [...products];

        if (filter === 'incre') {
            return arr.sort((a, b) => a.list[0].price - b.list[0].price);
        }

        if (filter === 'desc') {
            return arr.sort((a, b) => b.list[0].price - a.list[0].price);
        }

        return arr;
    }, [products, filter]);

    return (
        <div style={{ padding: 24 }}>
            <Space
                style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                }}
            >
                <Title level={2}>{title}</Title>

                <Space>
                    <FilterOutlined />

                    <Select
                        value={filter}
                        style={{ width: 200 }}
                        onChange={setFilter}
                        options={[
                            { value: 'default', label: 'Mặc định' },
                            { value: 'incre', label: 'Giá thấp đến cao' },
                            { value: 'desc', label: 'Giá cao đến thấp' },
                        ]}
                    />
                </Space>
            </Space>

            <Spin spinning={loading}>
                <Row gutter={[24, 24]}>
                    {sortedProducts.map((product, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={6}>
                            <ProductItem data={product} />
                        </Col>
                    ))}
                </Row>
            </Spin>
        </div>
    );
}

export default Category;
