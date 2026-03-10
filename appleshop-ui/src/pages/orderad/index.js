import classNames from 'classnames/bind';
import styles from './Order.module.scss';
import { OrderService } from '~/service/orderService';
import { useEffect, useState } from 'react';

import { FaFilter, FaShippingFast } from 'react-icons/fa';
const cx = classNames.bind(styles);
function OrderAd() {
    const [orders, setOrders] = useState();
    const [filterValue, setFilterValue] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const orderService = new OrderService();
        const fetchData = async function () {
            const res = await orderService.viewAll();
            setOrders(res);
            return res;
        };
        fetchData();
    }, []);

    const handleChangeStatus = (e, order) => {
        const orderCopy = order;
        orderCopy.status = e.target.value;
        const orderService = new OrderService();
        const fetchData = async function () {
            const res = await orderService.changeStatus(orderCopy);
            setIsLoading(!isLoading);
            return res;
        };
        fetchData();
    };

    const handleFilter = (e) => {
        setFilterValue(e.target.value);
    };
    const filteredOrders = filterValue !== 'all' ? orders.filter((order) => order.status === filterValue) : orders;
    return (
        <div className={cx('container')}>
            <div className={cx('order')}>
                <div className={cx('head')}>
                    <div className={cx('head-left')}>QUẢN LÝ ĐƠN HÀNG</div>
                    <div className={cx('head-right')}>
                        <FaFilter />
                        <select defaultValue={filterValue} onChange={(e) => handleFilter(e)}>
                            <option value="all">Tất cả</option>
                            <option value="Chờ xác nhận">Chờ xác nhận</option>
                            <option value="Đã xác nhận">Đã xác nhận</option>
                            <option value="Đang vận chuyển">Đang vận chuyển</option>
                            <option value="Đang giao hàng">Đang giao hàng</option>
                            <option value="Giao hàng thành công">Giao hàng thành công</option>
                            <option value="Đơn hàng đã được hoàn thành">Đơn hàng đã được hoàn thành</option>
                            <option value="Hủy đơn hàng">Hủy đơn hàng</option>
                        </select>
                    </div>
                </div>
                <div className={cx('infor')}>
                    {orders &&
                        filteredOrders.map((order, index) => {
                            const { sku, fullName, orderPhone, email, orderAddress, orderItemDTOs, totalPrice } = order;
                            const orderTime = new Date(order.orderTime);
                            const formattedDate = orderTime.toLocaleString();
                            return (
                                <div className={cx('item')} key={index}>
                                    <table className={cx('person')}>
                                        <tbody>
                                            <tr>
                                                <th>Mã số đơn hàng</th>
                                                <td>{sku}</td>
                                            </tr>
                                            <tr>
                                                <th>Họ và tên</th>
                                                <td>{fullName}</td>
                                            </tr>
                                            <tr>
                                                <th>Số điện thoại</th>
                                                <td>{orderPhone}</td>
                                            </tr>
                                            <tr>
                                                <th>Email</th>
                                                <td>{email}</td>
                                            </tr>
                                            <tr>
                                                <th>Hình thức thanh toán</th>
                                                <td>Thanh toán khi nhận được hàng</td>
                                            </tr>
                                            <tr>
                                                <th>Giao hàng đến</th>
                                                <td>{orderAddress}</td>
                                            </tr>
                                            <tr>
                                                <th>Thời gian nhận đơn</th>
                                                <td>{formattedDate}</td>
                                            </tr>
                                            <tr>
                                                <th>Thời gian dự kiến</th>
                                                <td>3 - 7 ngày sau khi xác nhận đơn hàng</td>
                                            </tr>
                                            <tr>
                                                <th>Ghi chú yêu cầu</th>
                                                <td>Giao hàng tất cả các ngày trong tuần</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p className={cx('text-detail')}>Chi tiết đơn hàng</p>
                                    <table className={cx('products')}>
                                        <tbody>
                                            <tr className={cx('headerTable')}>
                                                <th>Thông tin đơn hàng</th>
                                                <th>Số lượng</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                            {orderItemDTOs.map((product, index) => {
                                                const { quantity, memory, color, image, name, price } = product;
                                                return (
                                                    <tr key={index} className={cx('product')}>
                                                        <td>
                                                            <div className={cx('detail')}>
                                                                <img src={image} alt="Hình ảnh của sản phẩm"></img>
                                                                <span>{name + ' ' + memory + ' ' + color}</span>
                                                            </div>
                                                        </td>
                                                        <td>{quantity}</td>
                                                        <td>
                                                            <p className={cx('money')}>
                                                                {(price * quantity).toLocaleString('vi-VN') + 'đ'}
                                                            </p>
                                                            <strike>
                                                                {(price * 1.2 * quantity).toLocaleString('vi-VN') + 'đ'}
                                                            </strike>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className={cx('footer')}>
                                                <td colSpan={2}>
                                                    <div className={cx('status')}>
                                                        <div>
                                                            <FaShippingFast />
                                                            <select
                                                                className={cx('select')}
                                                                style={{ color: 'green' }}
                                                                onChange={(e) => handleChangeStatus(e, order)}
                                                                value={order.status}
                                                            >
                                                                <option
                                                                    disabled
                                                                    style={{ display: 'none' }}
                                                                    value="Chờ xác nhận"
                                                                >
                                                                    Chờ xác nhận
                                                                </option>
                                                                <option value="Đã xác nhận">Đã xác nhận</option>
                                                                <option value="Đang vận chuyển">Đang vận chuyển</option>
                                                                <option value="Đang giao hàng">Đang giao hàng</option>
                                                                <option value="Giao hàng thành công">
                                                                    Giao hàng thành công
                                                                </option>
                                                                <option
                                                                    style={{ display: 'none' }}
                                                                    value="Đơn hàng đã được hoàn thành"
                                                                >
                                                                    Đơn hàng đã được hoàn thành
                                                                </option>
                                                                <option value="Hủy đơn hàng">Hủy đơn hàng</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span>Tổng: </span>
                                                    <span className={cx('total_price')}>
                                                        {totalPrice.toLocaleString('vi-VN') + 'đ'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

export default OrderAd;
