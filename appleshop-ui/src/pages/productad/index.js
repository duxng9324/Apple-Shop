import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import Button from '~/components/Button';
import { useEffect, useState } from 'react';
import { ProductService } from '~/service/productService';
import Action from '~/components/Action';
import { AddPopup, DeletePopup, EditProduct } from './components';
import { CategoryService } from '~/service/categoryService';
import { ColorService } from '~/service/colorService';
import { MemoryService } from '~/service/memoryService';

const cx = classNames.bind(styles);

function ProductAd() {
    const [categories, SetCategories] = useState();
    useEffect(() => {
        const categoryService = new CategoryService();
        const fetchData = async function () {
            const res = await categoryService.view();
            SetCategories(res);
        };
        fetchData();
    }, []);

    const [colors, SetColors] = useState();
    useEffect(() => {
        const colorService = new ColorService();
        const fetchData = async function () {
            const res = await colorService.view();
            SetColors(res);
        };
        fetchData();
    }, []);

    const [memories, setMemories] = useState();
    useEffect(() => {
        const memoryService = new MemoryService();
        const fetchData = async function () {
            const res = await memoryService.view();
            setMemories(res);
        };
        fetchData();
    }, []);

    const [products, SetProducts] = useState([]);
    const [rowProduct, SetRowProduct] = useState();
    const [rowDelete, SetRowDelete] = useState();

    const [visibleAdd, setVisibleAdd] = useState(false);
    const visibleEdit = rowProduct ? rowProduct : null;
    const visibleDelete = rowDelete ? rowDelete : null;

    //popup edit
    const handleOpenEditPopup = (product) => {
        SetRowProduct(product);
    };

    //Popup Delete
    const handleOpenPopupDelete = (product) => {
        SetRowDelete(product);
    };

    // //popup add
    const handleOpenAddPopup = () => {
        setVisibleAdd(!visibleAdd);
    };
    useEffect(() => {
        if (visibleEdit) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'initial';
        }
    }, [visibleEdit]);
    useEffect(() => {
        const productService = new ProductService();
        const fetchData = async function () {
            const res = await productService.view();
            SetProducts(res);
        };
        fetchData();
    }, [visibleEdit, visibleDelete, visibleAdd]);
    const productsTb = products.map((product, index) => {
        const { id, name, code, description, imgLinks, list, categoryDTO, colorDTOs } = product;
        //link image
        let images = imgLinks.trim();
        let linksArray = imgLinks ? images.split(' ') : [];
        let thImage = linksArray.map((link, index) => {
            return (
                <div className={cx('thimage')} key={index}>
                    <p>{link}</p>
                </div>
            );
        });

        // memory -price
        const thList = list.map((item, index) => {
            return (
                <div className={cx('thlist')} key={index}>
                    <span>{item.type}</span>
                    <span>----</span>
                    <span>{item.price.toLocaleString('vi-VN') + ' VNĐ'}</span>
                </div>
            );
        });

        // color
        const thColor = colorDTOs.map((color, index) => {
            return (
                <div className={cx('thcolor')} key={index}>
                    <p>{color.color}</p>
                </div>
            );
        });
        return (
            <tr key={index}>
                <td>{id}</td>
                <td className={cx('name')}>{name}</td>
                <td className={cx('code')}>{code}</td>
                <td className={cx('description')}>{description}</td>
                <td className={cx('image_link')}>{thImage}</td>
                <td>{thList}</td>
                <td className={cx('color')}>{thColor}</td>
                <td className={cx('category')}>{categoryDTO.name}</td>
                <td>
                    <Action edit={() => handleOpenEditPopup(product)} remove={() => handleOpenPopupDelete(product)} />
                </td>
            </tr>
        );
    });
    return (
        <div className={cx('product')}>
            {visibleEdit && (
                <EditProduct
                    data={visibleEdit}
                    categories={categories}
                    colors={colors}
                    memories={memories}
                    onclick={() => handleOpenEditPopup(null)}
                />
            )}
            {visibleDelete && <DeletePopup data={visibleDelete} onclick={() => handleOpenPopupDelete(null)} />}
            {visibleAdd && (
                <AddPopup
                    handleOpenAddPopup={handleOpenAddPopup}
                    categories={categories}
                    colors={colors}
                    memories={memories}
                />
            )}
            <div className={cx('wrap-table')}>
                <div className={cx('header')}>
                    <p className={'content'}>
                        Table <b>Products</b>
                    </p>
                    <Button color="blue" onclick={handleOpenAddPopup}>
                        Add Product
                    </Button>
                </div>
                <div className={cx('body')}>
                    <table className={cx('table-product')}>
                        <thead>
                            <tr>
                                <th className={cx('id')}>ID</th>
                                <th className={cx('name')}>Name</th>
                                <th className={cx('code')}>Code</th>
                                <th className={cx('description')}>Description</th>
                                <th className={cx('image_link')}>Image Links</th>
                                <th className={cx('memrory_price')}>Memory - Price</th>
                                <th className={cx('color')}>Color</th>
                                <th className={cx('category')}>Category</th>
                                <th className={cx('action')}>Action</th>
                            </tr>
                        </thead>
                        <tbody>{productsTb}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProductAd;
