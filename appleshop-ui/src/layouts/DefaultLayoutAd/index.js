import { Outlet, useNavigate } from 'react-router-dom';
import HeaderAd from './header';
import SidebarAd from './sidebar';

import styles from './DefaultLayoutAd.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

const cx = classNames.bind(styles);

function DefaultLayoutAd() {
    const [sidebar, setSidebar] = useState(false);
    const showSidebar = () => setSidebar(!sidebar);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        const decoded = jwt_decode(token);
        if(!token) {
            navigate('/login');
        }
        else if (decoded.role !== 1) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className={cx('defaultLayoutAd')}>
            <HeaderAd onClick={showSidebar} />

            <div className={cx('body')}>
                {sidebar && <SidebarAd />}
                <Outlet />
            </div>
        </div>
    );
}
export default DefaultLayoutAd;
