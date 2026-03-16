import React from 'react';
import { Card, Button, Tag, Space, Carousel, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './ProductItem.module.scss';

const { Meta } = Card;

function ProductItem({ data }) {
    const navigate = useNavigate();

    const { imgLinks = [], colorDTOs = [], name = '', list = [], code = '' } = data || {};

    const prices = list.map((item) => item.price);
    const types = list.map((item) => item.type);

    const images = imgLinks.length > 0 ? imgLinks : ['https://via.placeholder.com/400x300?text=No+Image'];

    const handleViewDetail = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        navigate(`/${encodeURIComponent(code)}`);
    };

    return (
        <Card
            className={styles.productItem}
            hoverable
            cover={
                <Carousel autoplay className={styles.carousel}>
                    {images.map((img, index) => (
                        <div key={index} className={styles.slide}>
                            <Image src={img} alt={name} preview={false} className={styles.image} />
                        </div>
                    ))}
                </Carousel>
            }
        >
            <Meta title={name} />

            {/* Colors */}
            <div className={styles.colors}>
                <Space>
                    {colorDTOs.map((color, index) => (
                        <span key={index} className={styles.colorDot} style={{ backgroundColor: color.code }} />
                    ))}
                </Space>
            </div>

            {/* Memory */}
            <div className={styles.types}>
                <Space wrap>
                    {types.map((type, index) => (
                        <Tag key={index}>{type}</Tag>
                    ))}
                </Space>
            </div>

            {/* Price */}
            {prices.length > 0 && (
                <div className={styles.priceBox}>
                    <div className={styles.priceLabel}>Giá chỉ</div>

                    <div className={styles.price}>{prices[0].toLocaleString('vi-VN')} VNĐ</div>

                    <div className={styles.oldPrice}>{Math.round(prices[0] * 1.3).toLocaleString('vi-VN')} VNĐ</div>
                </div>
            )}

            <Button type="primary" block className={styles.button} onClick={handleViewDetail}>
                Xem chi tiết
            </Button>
        </Card>
    );
}

export default ProductItem;
