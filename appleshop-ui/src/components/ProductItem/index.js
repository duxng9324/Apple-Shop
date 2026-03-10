import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductItem.module.scss';

const cx = classNames.bind(styles);

function ProductItem(data) {
    const { imgLinks, colorDTOs, name, list, code } = data.data || {};
    const prices = list.map((item) => item.price);
    const types = list.map((item) => item.type);
    const imageArr = imgLinks.split(' ');

    const navigate = useNavigate();
    const handleViewDetail = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(encodeURIComponent(code));
        } else {
            navigate('/login');
        }
    };

    return (
        <div className={cx('product')}>
            <div
                className={cx('product__img')}
                style={{
                    backgroundImage: `url("${imageArr[0]}")`,
                }}
            ></div>
            <div className={cx('product__color')}>
                {colorDTOs.map((color, index) => {
                    return (
                        <div key={index} className={cx('product__color-item')} style={{ backgroundColor: color.code }}>
                            <span> </span>
                        </div>
                    );
                })}
            </div>
            <div className={cx('product__name')}>
                <span>{name}</span>
            </div>
            <div className={cx('product__memory')}>
                {types.map((type, index) => {
                    return (
                        <div key={index} className={cx('product__memory-item')}>
                            <strong>{type}</strong>
                        </div>
                    );
                })}
            </div>
            <div className={cx('product__price')}>
                <span className={cx('text')}>Giá chỉ</span>
                <span className={cx('price')}>{prices[0].toLocaleString('vi-VN') + ' VNĐ'}</span>
                <strike>{Math.round(prices[0] * 1.3).toLocaleString('vi-VN') + ' VNĐ'}</strike>
            </div>

            <button className={cx('btn_view')} onClick={handleViewDetail}>
                <span>Xem chi tiết</span>
            </button>
        </div>
    );
}

export default ProductItem;
