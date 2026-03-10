import React, { useEffect, useState } from 'react';
import { FaUser, FaShoppingCart, FaPhoneAlt, FaSignOutAlt, FaBarcode } from 'react-icons/fa';
import Tippy from '@tippyjs/react/headless';
import jwt_decode from 'jwt-decode';

import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '~/components/Button';
import Search from '~/components/Search';

const cx = classNames.bind(styles);

const listNav = [
    { name: 'iPhone', to: '/iphone' },
    { name: 'iPad', to: '/ipad' },
    { name: 'Mac', to: '/mac' },
    { name: 'Apple Watch', to: '/watch' },
    { name: 'Phụ kiện', to: '/phu-kien' },
];

const navigation = listNav.map((item, index) => {
    return (
        <NavLink className={(nav) => cx('item-nav', { active: nav.isActive })} to={item.to} key={index}>
            {item.name}
        </NavLink>
    );
});

function Header() {
    const navigate = useNavigate();
    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };
    const [token, setToken] = useState('');
    const [visible, setVisible] = useState(false);

    const handleClickUserIcon = () => {
        setVisible(!visible);
    };
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    const MenuInforUser = () => {
        if (token) {
            const decoded = jwt_decode(token);
            const { username, name } = decoded;
            return (
                <div>
                    <Link to="/user" className={cx('wrap-infor', 'item')}>
                        <div className={cx('name')}>{name}</div>
                        <div className={cx('username')}>{username}</div>
                    </Link>

                    {decoded.role === 0 && (
                        <Link to="./order" className={cx('order', 'item')}>
                            <FaBarcode />
                            <div className={cx('view')}>Xem hóa đơn mua hàng</div>
                        </Link>
                    )}
                    <div className={cx('sign-out', 'item')} onClick={handleSignOut}>
                        <FaSignOutAlt className={cx('icon')} />
                        Đăng Xuất
                    </div>
                </div>
            );
        }
        return <div>Đây là menu User</div>;
    };
    const token2 = localStorage.getItem('token');
    const decoded = token2 ? jwt_decode(token2) : null;
    return (
        <div>
            <div className={cx('header')}>
                <div className={cx('container')}>
                    <div className={cx('wrap-header')}>
                        <Link to="/" className={cx('logo')}>
                            <p>Studio</p>
                            <img src={require('~/assets/image/copyright_logo.png')} alt={'myimage'} />
                        </Link>
                        <Search />
                        {!token && (
                            <div className={cx('btn-login')}>
                                <Link to="/login">
                                    <Button color="transparency" text="#000 ">
                                        Đăng Nhập
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {token && (
                            <div className={cx('user')}>
                                <div>
                                    <Tippy
                                        interactive
                                        visible={visible}
                                        placement={'bottom-end'}
                                        render={(attrs) => (
                                            <div className={cx('infor')} tabIndex="-1" {...attrs}>
                                                <MenuInforUser />
                                            </div>
                                        )}
                                        onClickOutside={() => setVisible(!visible)}
                                    >
                                        <div className={cx('account')}>
                                            <FaUser size="24px" color="#fff" onClick={handleClickUserIcon} />
                                        </div>
                                    </Tippy>
                                </div>
                                {decoded?.role === 0 && (
                                    <Link to="/cart" style={{ textDecoration: 'none' }}>
                                        <div className={cx('cart')}>
                                            <FaShoppingCart size="24px" color="#fff" />
                                            <span>Giỏ hàng</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={cx('header-nav')}>
                <div className={cx('container')}>
                    {navigation}
                    <div className={cx('item-nav')}>
                        <a className={cx('button-call')} href="tel:18006601">
                            {' '}
                            <FaPhoneAlt />
                            <span>Gọi 1800 6601</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
