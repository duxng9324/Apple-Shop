import Header from './Header';
import styles from './DefaultLayout.module.scss';
import classNames from 'classnames/bind';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import ChatAssistant from '~/components/ChatAssistant';

const cx = classNames.bind(styles);

function DefaultLayout() {
    return (
        <div className={cx('defaultLayout')}>
            <Header />
            <div className={cx('flex1')}>
                <Outlet />
            </div>
            <Footer />
            <ChatAssistant />
        </div>
    );
}

export default DefaultLayout;
