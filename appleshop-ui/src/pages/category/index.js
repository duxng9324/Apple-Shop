import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import ProductItem from '~/components/ProductItem';
import { ProductService } from '~/service/productService';
import { useEffect, useMemo, useState } from 'react';
import { FaFilter } from 'react-icons/fa';

const cx = classNames.bind(styles);

function Category(props) {
    const { title } = props;

    const [filter, setFilter] = useState('default');
    const [isLoading, setIsLoading] = useState(false);
    const handleChangeFilter = (e) => {
        setFilter(e.target.value);
    };

    let device;
    switch (title) {
        case 'iPhone':
            device = 'iphone';
            break;
        case 'iPad':
            device = 'ipad';
            break;
        case 'MAC':
            device = 'macbook';
            break;
        case 'Apple Watch':
            device = 'applewatch';
            break;
        case 'Phụ kiện':
            device = 'phu-kien';
            break;
        default:
            break;
    }

    const [products, setProducts] = useState([]);

    const productsSort = (arrays, attr) => {
        if (attr === 'default') {
            setIsLoading(!isLoading);
            return arrays;
        } else if (attr === 'incre') {
            arrays.sort((a, b) => {
                return a.list[0].price - b.list[0].price;
            });
        } else {
            arrays.sort((a, b) => {
                return b.list[0].price - a.list[0].price;
            });
        }
    };
    useEffect(() => {
        const productService = new ProductService();
        const fetchData = async function () {
            const res = await productService.viewProductByCate({ device });
            setProducts(res);
        };
        fetchData();
    }, [device, isLoading]);
    useMemo(() => {
        productsSort(products, filter);
    }, [filter]);
    const listProduct = products.map((product, index) => {
        return <ProductItem data={product} key={index} />;
    });

    return (
        <div className={cx('container')}>
            <div className={cx('category')}>
                <div className={cx('title')}>
                    <span>{title}</span>
                </div>
                <div className={cx('filter')}>
                    <FaFilter />
                    <select onChange={(e) => handleChangeFilter(e)} defaultValue="default">
                        <option value="default">Mặc định</option>
                        <option value="incre">Giá Thấp đến Cao</option>
                        <option value="desc">Giá Cao đến Thấp</option>
                    </select>
                </div>
                <div className={cx('list-item')}>{listProduct}</div>
            </div>
        </div>
    );
}

export default Category;
