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
            try {
                const res = await productService.view();
                setProducts(Array.isArray(res) ? res : []);
            } catch (error) {
                console.error('Failed to fetch products for search:', error);
                setProducts([]);
            }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, products]);

    const handleClickSearch = () => {
        if (!searchTerm || searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        if (!Array.isArray(products)) {
            setSearchResults([]);
            return;
        }

        const filteredProducts = products.filter((product) => {
            if (!product || !product.name) return false;
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
                            const imageLinks = imgLinks && imgLinks.length > 0 ? imgLinks[0] : '';
                            const url = `/${encodeURIComponent(categoryCode || '')}/${encodeURIComponent(code || '')}`;

                            return (
                                <Link to={token ? url : '/login'} key={product.id || code} className={cx('result-item')}>
                                    <div className={cx('left')}>
                                        {imageLinks && <img src={imageLinks} alt={name || "Hình ảnh của sản phẩm"} />}
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
                        onChange={(event) => {
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
