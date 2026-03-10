import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { FaSistrix } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { ProductService } from '~/service/productService';
import Tippy from '@tippyjs/react/headless';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Search() {
    const token = localStorage.getItem('token');
    const [visible, setVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const productService = new ProductService();
        const fetchData = async function () {
            const res = await productService.view();
            setProducts(res);
            return res;
        };
        fetchData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClickSearch();
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    const handleClickSearch = () => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filteredProducts = products.filter((product) => {
            return product.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        setSearchResults(filteredProducts);
    };

    return (
        <div className={cx('wrap')}>
            <Tippy
                interactive
                visible={visible}
                placement={'bottom'}
                render={(attrs) => (
                    <div
                        className={cx('result')}
                        tabIndex="-1"
                        {...attrs}
                        style={{ maxHeight: '233px', overflowX: 'hidden', overflowY: 'auto' }}
                    >
                        {searchResults.map((product) => {
                            const { name, code, categoryCode, imgLinks } = product;
                            const imageLinks = imgLinks.split(' ')[0];
                            const url = `/${encodeURIComponent(categoryCode)}/${encodeURIComponent(code)}`;

                            return (
                                <Link to={token ? url : '/login'} key={product.id} className={cx('result-item')}>
                                    <div className={cx('left')}>
                                        <img src={imageLinks} alt="Hình ảnh của sản phẩm" />
                                    </div>
                                    <div className={cx('right')}>
                                        <p className={cx('product_name')}>{name}</p>
                                        <p className={cx('category')}>{categoryCode}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                onClickOutside={() => setVisible(false)}
            >
                <div className={cx('search')}>
                    <FaSistrix />
                    <input
                        onInput={(event) => {
                            setSearchTerm(event.target.value);
                            setVisible(true);
                        }}
                        type="text"
                        placeholder="Bạn đang tìm kiếm sản phẩm"
                    />
                </div>
            </Tippy>
        </div>
    );
}

export default Search;
