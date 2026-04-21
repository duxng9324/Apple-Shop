import classNames from 'classnames/bind';
import styles from './Order.module.scss';
import { OrderService } from '~/service/orderService';
import { useEffect, useRef, useState } from 'react';
import jwt_decode from 'jwt-decode';
import Button from '~/components/Button';
import { FaArrowUp, FaShippingFast } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { PopupComment } from './component';

const cx = classNames.bind(styles);
function Order() {
    const location = useLocation();
    let isScroll = location.state;
    const token = localStorage.getItem('token');
    const decode = (() => {
        if (!token) return null;
        try {
            return jwt_decode(token);
        } catch {
            return null;
        }
    })();
    const userId = decode?.id;
    const [orders, setOrders] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const [visibleComment, setVisibleComment] = useState();

    useEffect(() => {
        if (!userId) {
            setOrders([]);
            return;
        }

        const orderService = new OrderService();
        const fetchData = async function () {
            const res = await orderService.view({ userId });
            setOrders(res);
            setIsLoading(false);
            return res;
        };
        fetchData();
    }, [userId, isLoading]);

    useEffect(() => {
        if (isScroll === true && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
            const note = cx('note');
            scrollRef.current.classList.add(note);
            isScroll = false;
            setTimeout(() => {
                scrollRef.current.classList.remove(note);
            }, 1200);
        }
    }, [orders, isScroll]);

    const [showBackToTop, setShowBackToTop] = useState(false);
    const backToTopRef = useRef(null);
    const handleScroll = () => {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const scrollThreshold = windowHeight / 2;

        setShowBackToTop(scrollPosition > scrollThreshold);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const handleBackToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleOpenPopupCmt = (listProduct, orderId) => {
        if (!userId) {
            return;
        }
        setVisibleComment({ listProduct, userId, orderId });
        document.body.style.overflow = 'hidden';
    };
    const handleClosePopupCmt = () => {
        setVisibleComment(null);
        document.body.style.overflow = 'auto';
    };

    const handleLoading = () => {
        setIsLoading(!isLoading);
    };

    const getPaymentMethodLabel = (method) => {
        if (method === 'VNPAY_QR') return 'VNPay chuyển khoản qua QR';
        if (method === 'BANK_TRANSFER') return 'Chuyển khoản online';
        return 'Thanh toán khi nhận được hàng';
    };

    const printInvoice = (order) => {
        const invoiceWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!invoiceWindow) {
            return;
        }
        const itemRows = order.orderItemDTOs
            .map((item, index) => {
                const itemTotal = item.price * item.quantity;
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name} ${item.memory} ${item.color}</td>
                        <td>${item.quantity}</td>
                        <td>${Number(item.price).toLocaleString('vi-VN')} đ</td>
                        <td>${Number(itemTotal).toLocaleString('vi-VN')} đ</td>
                    </tr>
                `;
            })
            .join('');

        invoiceWindow.document.write(`
            <html>
              <head>
                <title>Hoa don ${order.sku}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                    h1 { margin-bottom: 4px; }
                    .meta { margin-bottom: 12px; color: #374151; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                    th { background: #f3f4f6; }
                    .summary { margin-top: 16px; font-size: 18px; font-weight: 700; }
                </style>
              </head>
              <body>
                <h1>Hoa don ban hang - Studio</h1>
                <div class="meta">Ma don: ${order.sku}</div>
                <div class="meta">Khach hang: ${order.fullName}</div>
                <div class="meta">So dien thoai: ${order.orderPhone}</div>
                <div class="meta">Email: ${order.email || ''}</div>
                <div class="meta">Dia chi: ${order.orderAddress}</div>
                <div class="meta">Thoi gian dat: ${new Date(order.orderTime).toLocaleString()}</div>
                <div class="meta">Phuong thuc thanh toan: ${getPaymentMethodLabel(order.paymentMethod)}</div>
                <div class="meta">Trang thai thanh toan: ${order.paymentStatus || 'Chua thanh toan'}</div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>San pham</th>
                            <th>So luong</th>
                            <th>Don gia</th>
                            <th>Thanh tien</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div class="summary">Tong thanh toan: ${Number(order.totalPrice).toLocaleString('vi-VN')} đ</div>
              </body>
            </html>
        `);
        invoiceWindow.document.close();
        invoiceWindow.focus();
        invoiceWindow.print();
    };

    return (
        <div className={cx('container')}>
            {visibleComment && (
                <PopupComment props={visibleComment} remove={handleClosePopupCmt} loading={handleLoading} />
            )}
            {showBackToTop && (
                <button className={cx('backToTop')} onClick={handleBackToTop} ref={backToTopRef}>
                    <FaArrowUp />
                </button>
            )}
            <div className={cx('order')}>
                <div className={cx('head')}>Thông tin đặt hàng</div>
                <div className={cx('thank')}>
                    <img
                        src={require('~/assets/image/order_success.png')}
                        className={cx('order_thanks')}
                        alt="Hình ảnh đặt hàng thành công"
                    ></img>
                    <p className={cx('talk')}>Cảm ơn quý khách đã mua hàng tại Studio</p>
                    <p className={cx('tel')}>
                        Nếu có điều gì thắc mắc xin liên hệ bộ phận chăm sóc khách hàng
                        <a href="tel:18006616">18006616</a>
                    </p>
                </div>
                <div className={cx('infor')}>
                    {orders &&
                        orders.map((order, index) => {
                            const {
                                id,
                                sku,
                                fullName,
                                orderPhone,
                                email,
                                orderAddress,
                                orderItemDTOs,
                                totalPrice,
                                status,
                                checkCmt,
                                paymentMethod,
                                paymentStatus,
                            } = order;
                            const handleCofirm = () => {
                                order.status = 'Đơn hàng đã được hoàn thành';
                                const orderService = new OrderService();
                                const fetchData = async function () {
                                    const res = await orderService.changeStatus(order);
                                    return res;
                                };
                                fetchData();
                                setIsLoading(true);
                            };
                            const orderTime = new Date(order.orderTime);
                            const formattedDate = orderTime.toLocaleString();
                            const isLastItem = index === orders.length - 1;

                            const handleCancel = () => {
                                order.status = 'Hủy đơn hàng';
                                const orderService = new OrderService();
                                const fetchData = async function () {
                                    const res = await orderService.changeStatus(order);
                                    return res;
                                };
                                fetchData();
                                setIsLoading(true);
                            };
                            return (
                                <div className={cx('item')} key={index} ref={isLastItem ? scrollRef : null}>
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
                                                <td>{getPaymentMethodLabel(paymentMethod)}</td>
                                            </tr>
                                            <tr>
                                                <th>Trạng thái thanh toán</th>
                                                <td>{paymentStatus || 'Chưa thanh toán'}</td>
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
                                                            {status}
                                                        </div>
                                                        {status === 'Chờ xác nhận' && (
                                                            <Button onclick={() => handleCancel()} color="red">
                                                                Hủy đơn hàng
                                                            </Button>
                                                        )}
                                                        {status === 'Giao hàng thành công' && (
                                                            <Button onclick={() => handleCofirm()} color="#0664f9">
                                                                Đã nhận được hàng
                                                            </Button>
                                                        )}
                                                        {status === 'Đơn hàng đã được hoàn thành' && checkCmt === 0 && (
                                                            <Button
                                                                onclick={() => handleOpenPopupCmt(orderItemDTOs, id)}
                                                                color="#0664f9"
                                                            >
                                                                Đánh giá
                                                            </Button>
                                                        )}
                                                        <Button onclick={() => printInvoice(order)} color="#32373d">
                                                            In hóa đơn
                                                        </Button>
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

export default Order;
