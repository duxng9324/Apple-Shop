import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { FaBox, FaCrown, FaHandsHelping, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const listKey = [
    {
        icon: <FaHandsHelping />,
        title: 'Thương hiệu đảm bảo',
        desc: 'Sản phẩm chính hãng Apple',
    },
    {
        icon: <FaShieldAlt />,
        title: 'Bảo hành chính hãng',
        desc: 'Bảo hành theo chính sách Apple',
    },
    {
        icon: <FaBox />,
        title: 'Giao hàng tận nơi',
        desc: 'Tại 63 tỉnh thành',
    },
    {
        icon: <FaCrown />,
        title: 'Trải nghiệm Premium',
        desc: 'Không gian trải nghiệm cao cấp',
    },
];
const KeySelling = listKey.map((key, index) => {
    const { icon, title, desc } = key;
    return (
        <div className={cx('key-selling-item')} key={index}>
            <div className={cx('icon')}>{icon}</div>

            <div className={cx('wrap-content')}>
                <span className={cx('title')}>{title}</span>
                <span className={cx('desc')}>{desc}</span>
            </div>
        </div>
    );
});

function Footer() {
    return (
        <div className={cx('footer')}>
            <div className={cx('key-selling')}>
                <div className={cx('container')}>{KeySelling}</div>
            </div>
            <div className={cx('footer-middle')}>
                <div className={cx('container')}>
                    <div className={cx('footer-content')}>
                        <div className={cx('footer-info')}>
                            <div className={cx('hotline')}>
                                <div className={cx('item')}>
                                    <div className={cx('text')}>Giao hàng miễn phí</div>
                                    <a className={cx('phone')} href="tel:18006601">
                                        1800 6601
                                    </a>
                                </div>
                                <div className={cx('item')}>
                                    <div className={cx('text')}>Chăm sóc khách hàng</div>
                                    <a className={cx('phone')} href="tel:18006616">
                                        1800 6616
                                    </a>
                                </div>
                            </div>
                            <div className={cx('service')}>
                                <div className={cx('text')}> Dịch vụ và hỗ trợ</div>
                                <ul>
                                    <li>HCM: 121 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM</li>
                                    <li>Hà Nội: 92 Hai Bà Trưng, P. Cửa Nam, Q. Hoàn Kiếm, TP. Hà Nội</li>
                                    <li>Đà Nẵng: 240 Hoàng Diệu, Q. Hải Châu, TP. Đà Nẵng</li>
                                    <li>Cần Thơ: 52 - 54 - 56 Đường 30/4, P. An Phú, Q. Ninh Kiều, Cần Thơ</li>
                                </ul>
                            </div>
                            <div className={cx('img')}>
                                <img src={require('~/assets/image/lg-bct.png')} alt="item-footer" />
                            </div>
                        </div>
                        <div className={cx('footer-category')}>
                            <div className={cx('category-item')}>
                                <div className={cx('title')}>Sản phẩm</div>
                                <ul>
                                    <li>
                                        <Link to="/iphone">Iphone</Link>
                                    </li>
                                    <li>
                                        <Link to="/ipad">Ipad</Link>
                                    </li>
                                    <li>
                                        <Link to="/mac">Mac</Link>
                                    </li>
                                    <li>
                                        <Link to="/watch">Apple Watch</Link>
                                    </li>
                                    <li>
                                        <Link to="/phu-kien">Phụ Kiện</Link>
                                    </li>
                                </ul>
                            </div>
                            <div className={cx('category-item')}>
                                <div className={cx('title')}>Chính sách</div>
                                <ul>
                                    <li>
                                        <Link to="/">Chính sách bảo mật</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Chính sách đổi trả sản phẩm</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Chính sách bảo hành</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Chính sách giao nhận</Link>
                                    </li>
                                </ul>
                            </div>
                            <div className={cx('category-item')}>
                                <div className={cx('title')}>Về chúng tôi</div>
                                <ul>
                                    <li>
                                        <Link to="/">Giới thiệu</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Tin tức thủ thuật</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Hệ thống cửa hàng</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Câu hỏi thường gặp</Link>
                                    </li>
                                    <li>
                                        <Link to="/">Hướng dẫn mua hàng</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={cx('footer-bottom')}>
                <p>
                    Apple, the Apple logo are trademark of Apple inc, registered in the US, and other countries
                    Copyright 2007 - 2022 Công Ty Cổ Phần Bán Lẻ Kỹ Thuật Số. GPĐKKD số 031160988.
                </p>
            </div>
        </div>
    );
}

export default Footer;
