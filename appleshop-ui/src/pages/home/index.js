import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import styles from './Home.module.scss';
import { useEffect, useRef } from 'react';

const cx = classNames.bind(styles);
const BannerIphone14pro = () => {
    const token = localStorage.getItem('token');

    return (
        <div className={cx('unit-link')}>
            <Link to={token ? '/iphone/iphone_14_pro_max' : '/login'}>
                <span className={cx('name')}>iPhone 14 Pro</span>
                <span className={cx('desc')}>by Apple U.S.A</span>
            </Link>
        </div>
    );
};

const Bannerphone14 = () => {
    const token = localStorage.getItem('token');

    return (
        <div className={cx('unit-link-2')}>
            <Link to={token ? '/iphone/iphone_14_pro' : '/login'}>
                <span className={cx('name')}>iPhone 14</span>
                <span className={cx('desc')}>Kích thước tuyệt vời - Màu sắc đa dạng</span>
            </Link>
        </div>
    );
};
function Home() {
    const containerRef = useRef(null);

    useEffect(() => {
        function handleScroll() {
            const show = cx('show');
            const containerTop = containerRef.current.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (containerTop < windowHeight * 0.55) {
                containerRef.current.classList.add(show);
            } else {
                containerRef.current.classList.remove(show);
            }
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <div className={cx('home')}>
            <BannerIphone14pro />
            <Bannerphone14 />
            <div className={cx('banner-watch')}>
                <Link to="/watch">
                    <span className={cx('name')}>Apple Watch</span>
                    <span className={cx('desc')}>Bước nhảy vọt cho sức khỏe</span>
                </Link>
            </div>
            <div className={cx('module-content')}>
                <div className={cx('banner-mac')}>
                    <Link to="/mac">
                        <span className={cx('name')}>MacBook Pro</span>
                        <span className={cx('desc')}>Tăng năng suất làm việc</span>
                    </Link>
                </div>
                <div className={cx('banner-ipad')}>
                    <Link to="/ipad">
                        <span className={cx('name')}>iPad</span>
                        <span className={cx('desc')}>Sành điệu. Sáng tạo. Năng động</span>
                    </Link>
                </div>
            </div>
            <div className={cx('accessory')}>
                <Link to="/phu-kien" className={cx('wrap-container')} ref={containerRef}>
                    <div className={cx('content')}>
                        <span className={cx('name')}>Phụ kiện</span>
                        <span className={cx('desc')}>Khám phá và tìm kiếm những thứ tốt nhất cho bạn</span>
                    </div>
                    <div className={cx('backgr')}>
                        <img src={require('~/assets/image/bg-home-phukien-removebg.png')} alt="item-phukien"></img>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Home;
