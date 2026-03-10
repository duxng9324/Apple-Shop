import { FaSearch } from 'react-icons/fa';
import Input from '../Input';
import styles from './SearchAd.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
const inputField = {
    type: 'text',
    name: 'code',
    placeholder: 'Bạn đang tìm kiếm thông tin sản phẩm',
    value: '',
};
function SearchAd() {
    return (
        <div className={cx('search')}>
            <FaSearch fontSize={'20px'} color="#444b52" className={cx('faSearch')} />
            <Input props={inputField} />
        </div>
    );
}

export default SearchAd;
