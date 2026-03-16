import classNames from 'classnames/bind';
import styles from './Detail.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';

import { Row, Col, Card, Carousel, Image, Button, Tag, Rate, Avatar, Input, Divider, Space } from 'antd';

import { ProductService } from '~/service/productService';
import { CartService } from '~/service/cartService';
import { CommentService } from '~/service/commentService';

import jwt_decode from 'jwt-decode';

const cx = classNames.bind(styles);
const { TextArea } = Input;

function Detail() {
    const { productCode } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [priceIndex, setPriceIndex] = useState(0);
    const [colorIndex, setColorIndex] = useState(0);
    const [reload, setReload] = useState(false);
    const [replyText, setReplyText] = useState('');

    const token = localStorage.getItem('token');
    const user = token ? jwt_decode(token) : null;

    const productService = new ProductService();
    const cartService = new CartService();
    const commentService = new CommentService();

    /* ---------------- FETCH PRODUCT ---------------- */

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await productService.viewProductByCode({ productCode });
            setProduct(res);
        };

        fetchProduct();
    }, [productCode, reload]);

    /* ---------------- BUY PRODUCT ---------------- */

    const handleBuy = async () => {
        if (!user) return navigate('/login');

        const item = {
            userId: user.id,
            productId: product.id,
            memory: product.list?.[priceIndex]?.type,
            color: product.colorDTOs?.[colorIndex]?.color,
        };

        await cartService.add(item);
        navigate('/cart');
    };

    /* ---------------- RATING ---------------- */

    const averageRating = useMemo(() => {
        if (!product?.commentDTOs?.length) return 0;

        const total = product.commentDTOs.reduce((sum, c) => sum + c.rating, 0);

        return Math.round(total / product.commentDTOs.length);
    }, [product]);

    const timeAgo = (time) => {
        const diff = Date.now() - time;
        const minute = 60 * 1000;

        if (diff < minute) return `${Math.floor(diff / 1000)} giây trước`;
        if (diff < minute * 60) return `${Math.floor(diff / minute)} phút trước`;
        if (diff < minute * 60 * 24) return `${Math.floor(diff / (minute * 60))} giờ trước`;

        return `${Math.floor(diff / (minute * 60 * 24))} ngày trước`;
    };

    if (!product) return null;

    const { imgLinks, name, list, colorDTOs, commentDTOs, description } = product;

    return (
        <div className={cx('container')}>
            <Card>
                <Row gutter={40}>
                    {/* IMAGE */}
                    <Col span={12}>
                        <Carousel autoplay>
                            {imgLinks?.map((img, index) => (
                                <Image
                                    key={index}
                                    src={img}
                                    preview
                                    style={{ width: '100%', height: 400, objectFit: 'cover' }}
                                />
                            ))}
                        </Carousel>
                    </Col>

                    {/* INFO */}
                    <Col span={12}>
                        <h1>{name}</h1>

                        <Space size="large">
                            <span style={{ fontSize: 28, color: '#ff4d4f', fontWeight: 600 }}>
                                {list?.[priceIndex]?.price.toLocaleString('vi-VN')} VNĐ
                            </span>

                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                {Math.floor(list?.[priceIndex]?.price * 1.2).toLocaleString('vi-VN')} VNĐ
                            </span>
                        </Space>

                        <Divider />

                        {/* MEMORY */}
                        <div>
                            <h4>Dung lượng</h4>

                            <Space wrap>
                                {list?.map((item, index) => (
                                    <Tag
                                        key={index}
                                        color={index === priceIndex ? 'blue' : 'default'}
                                        style={{ cursor: 'pointer', padding: '6px 12px' }}
                                        onClick={() => setPriceIndex(index)}
                                    >
                                        {item.type}
                                    </Tag>
                                ))}
                            </Space>
                        </div>

                        <Divider />

                        {/* COLOR */}
                        <div>
                            <h4>Màu sắc</h4>

                            <Space>
                                {colorDTOs?.map((c, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setColorIndex(index)}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: c.code,
                                            border: index === colorIndex ? '3px solid #1677ff' : '1px solid #ddd',
                                            cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </Space>
                        </div>

                        <Divider />

                        <Button type="primary" size="large" block onClick={handleBuy} disabled={user?.role !== 0 && user?.role =="ADMIN"}>
                            MUA NGAY
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* DESCRIPTION */}
            <Card title="Mô tả sản phẩm" style={{ marginTop: 24 }}>
                {description}
            </Card>

            {/* REVIEW */}
            {commentDTOs?.length > 0 && (
                <Card title="Đánh giá sản phẩm" style={{ marginTop: 24 }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Rate disabled value={averageRating} />
                            <span style={{ marginLeft: 10 }}>
                                {averageRating}/5 ({commentDTOs.length} đánh giá)
                            </span>
                        </div>

                        {commentDTOs.map((c) => (
                            <Card key={c.id} size="small">
                                <Space align="start">
                                    <Avatar src={c.user?.images} />

                                    <div>
                                        <strong>{c.userName}</strong>

                                        <div>
                                            <Rate disabled value={c.rating} />
                                        </div>

                                        <p>{c.comment}</p>

                                        <small>{timeAgo(c.timeCmt)}</small>

                                        {c.reply && (
                                            <Card size="small" style={{ marginTop: 10, background: '#fafafa' }}>
                                                <strong>{c.adminName}</strong>
                                                <p>{c.reply}</p>
                                            </Card>
                                        )}

                                        {!c.reply && user?.role === 1 && (
                                            <Space style={{ marginTop: 10 }}>
                                                <Input
                                                    placeholder="Nhập phản hồi"
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />

                                                <Button
                                                    type="primary"
                                                    onClick={async () => {
                                                        await commentService.addRep({
                                                            id: c.id,
                                                            reply: replyText,
                                                            adminId: user.id,
                                                        });

                                                        setReload(!reload);
                                                        setReplyText('');
                                                    }}
                                                >
                                                    Gửi
                                                </Button>
                                            </Space>
                                        )}
                                    </div>
                                </Space>
                            </Card>
                        ))}
                    </Space>
                </Card>
            )}
        </div>
    );
}

export default Detail;
