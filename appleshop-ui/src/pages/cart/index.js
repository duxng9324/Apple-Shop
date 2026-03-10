import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import data from '~/data/data.json';
import { useEffect, useMemo, useState } from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import jwt_decode from 'jwt-decode';
import { CartService } from '~/service/cartService';
import ProductCartItem from '~/components/ProductCartItem';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { OrderService } from '~/service/orderService';

const cx = classNames.bind(styles);

function Cart() {
    const navigate = useNavigate();
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [checkRemove, setCheckRemove] = useState(false);
    const handleChageProvince = (e) => {
        setDistrict('');
        setWard('');
        setProvince(e.target.value);
    };
    const handleChangeDistrict = (e) => {
        setDistrict(e.target.value);
        setWard('');
    };
    const handleChangeWard = (e) => {
        setWard(e.target.value);
    };

    const token = localStorage.getItem('token');
    const decode = jwt_decode(token);
    const userId = decode.id;
    const [items, setItems] = useState([]);

    const onRemove = () => {
        setCheckRemove(!checkRemove);
    };

    const cartService = new CartService();
    useEffect(() => {
        const fetchData = async function () {
            const res = await cartService.view({ userId });
            setItems(res);
            return res;
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
        fullName: yup.string().required('Hãy nhập tên của bạn'),
        orderPhone: yup.string().required('Hãy nhập số điện thoại của bạn'),
        email: yup.string().required('Hãy nhập email của bạn'),
        province: yup.string().required('Hãy chọn tỉnh thành của bạn'),
        district: yup.string().required('Hãy chọn quận huyện của bạn'),
        ward: yup.string().required('Hãy chọn đầy đủ xã phường của bạn'),
        myhome: yup.string().required('Hãy nhập địa chỉ cụ thể nhà của bạn'),
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const orderService = new OrderService();
    const onOrder = async (data) => {
        const orderItemDTOs = [];
        items.forEach((item) => {
            const { productDTO, memory, color, quantity } = item;
            const orderItem = {
                image: productDTO.imgLinks.split(' ')[0],
                name: productDTO.name,
                quantity: quantity,
                price: productDTO.list.find((item) => item.type === memory).price,
                memory: memory,
                color: color,
            };
            orderItemDTOs.push(orderItem);
        });
        const params = {
            fullName: data.fullName,
            sex: data.sex,
            orderPhone: data.orderPhone,
            email: data.email,
            orderAddress: data.myhome + ', ' + data.ward + ', ' + data.district + ', ' + data.province,
            totalPrice: priceAll,
            userId: userId,
            orderItemDTOs: orderItemDTOs,
        };
        try {
            await orderService.add(params);
            await cartService.removeAll(userId);
            setItems([]);
            navigate('/order', { state: true });
        } catch {}
    };
    return (
        <div className={cx('container')}>
            <div className={cx('return')}>
                <FaAngleLeft />
                <Link to="/">Tiếp tục mua hàng</Link>
            </div>
            {items.length === 0 && (
                <div className={cx('no-items')}>
                    <img src={require('~/assets/image/no-items.png')} alt="Hình ảnh giỏ hàng không có sản phẩm" />
                    <p>Chưa có sản phẩm nào trong giỏ hàng</p>
                </div>
            )}
            {items.length > 0 && (
                <div className={cx('cart')}>
                    <div className={cx('count')}>Có {items.length} sản phẩm trong giỏ hàng</div>
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
                    <div className={cx('totalprice')}>
                        <div className={cx('wrap')}>
                            <div className={cx('totalprice-row')}>
                                <span>Tổng tiền</span>
                                <span>{(priceAll * 1.2).toLocaleString('vi-VN') + 'đ'}</span>
                            </div>
                            <div className={cx('totalprice-row')}>
                                <span>Giảm: </span>
                                <span>-{(priceAll * 0.2).toLocaleString('vi-VN') + 'đ'}</span>
                            </div>
                            <div className={cx('totalprice-row')}>
                                <strong>Cần thanh toán</strong>
                                <span className={cx('text-price-l')}>{priceAll.toLocaleString('vi-VN') + 'đ'}</span>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit(onOrder)}>
                        <div className={cx('sex')}>
                            <input type="radio" id="male" name="sex" value="male" {...register('sex')} />
                            <label htmlFor="male">Nam</label>
                            <input type="radio" id="female" name="sex" value="female" {...register('sex')} />
                            <label htmlFor="female">Nữ</label>
                        </div>
                        <p className={cx('errors')}>{errors.sex?.message}</p>
                        <div className={cx('line')}>
                            <input
                                type="text"
                                name="fullName"
                                id="name"
                                placeholder="Nhập họ và tên"
                                {...register('fullName')}
                            />
                        </div>
                        <p className={cx('errors')}>{errors.fullName?.message}</p>
                        <div className={cx('line')}>
                            <input
                                type="phone"
                                name="orderPhone"
                                id="phone"
                                placeholder="Nhập số điện thoại"
                                {...register('orderPhone')}
                            />
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Nhập email"
                                {...register('email')}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p className={cx('errors')}>{errors.orderPhone?.message}</p>
                            <p className={cx('errors')}>{errors.email?.message}</p>
                        </div>
                        <div className={cx('address')}>
                            <select
                                className={cx('province')}
                                {...register('province')}
                                value={province}
                                onChange={handleChageProvince}
                            >
                                <option value="" disabled style={{ display: 'none' }}>
                                    tỉnh/thành
                                </option>
                                {data.map((province, index) => {
                                    return (
                                        <option key={index} value={province.name}>
                                            {province.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className={cx('errors')}>{errors.province?.message}</p>
                            <select
                                className={cx('district')}
                                {...register('district')}
                                value={district}
                                onChange={handleChangeDistrict}
                            >
                                <option value="" disabled style={{ display: 'none' }}>
                                    quận/huyện
                                </option>
                                {province &&
                                    data
                                        .find((data) => data.name === province)
                                        .huyen.map((district, index) => {
                                            return (
                                                <option key={index} value={district.name}>
                                                    {district.name}
                                                </option>
                                            );
                                        })}
                            </select>
                            <p className={cx('errors')}>{errors.district?.message}</p>
                            <select
                                className={cx('ward')}
                                {...register('ward')}
                                value={ward}
                                onChange={handleChangeWard}
                            >
                                <option value="" disabled style={{ display: 'none' }}>
                                    xã/phường
                                </option>
                                {district &&
                                    data
                                        .find((data) => data.name === province)
                                        ?.huyen.find(({ name }) => name === district)
                                        .xa.map((ward, index) => {
                                            return (
                                                <option key={index} value={ward.name}>
                                                    {ward.name}
                                                </option>
                                            );
                                        })}
                            </select>
                            <p className={cx('errors')}>{errors.ward?.message}</p>
                            <input
                                type="text"
                                name="myhome"
                                {...register('myhome')}
                                id="myhome"
                                placeholder="Nhập địa chỉ nhà của bạn"
                            />
                            <p className={cx('errors')}>{errors.myhome?.message}</p>
                        </div>
                        <div className={cx('footer')}>
                            <button type="submit" className={cx('btn-order')}>
                                Hoàn tất đặt hàng
                            </button>
                            <div className={cx('confirm')}>
                                <p>
                                    Bằng cách đặt hàng, bạn đồng ý với <i>Điều khoản sử dụng</i> của chúng tôi
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Cart;
