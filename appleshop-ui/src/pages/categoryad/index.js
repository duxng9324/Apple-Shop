import classNames from 'classnames/bind';
import styles from './CategoryAd.module.scss';
import { CategoryService } from '~/service/categoryService';
import Action from '~/components/Action';
import Button from '~/components/Button';
import { AddPopup, DeletePopup, EditCategoryPopup } from './components';

import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function CategoryAd() {
    const [categories, setCategories] = useState([]);
    const [rowCategory, setRowCategory] = useState(); // select row edit
    const [rowDelete, setRowDelete] = useState();

    const [visibleAdd, setVisibleAdd] = useState(false);
    const visibleDelete = rowDelete ? rowDelete : null;
    const visibleEdit = rowCategory ? rowCategory : null;

    //popupEdit
    const handleOpenPopup = (category) => {
        setRowCategory(category);
    };

    //Popup Delete
    const handleOpenPopupDelete = (category) => {
        setRowDelete(category);
    };

    //popup add
    const handleOpenAddPopup = () => {
        setVisibleAdd(!visibleAdd);
    };

    useEffect(() => {
        const categoryService = new CategoryService();
        const fetchData = async function () {
            const res = await categoryService.view();
            setCategories(res);
        };
        fetchData();
    }, [rowCategory, rowDelete, visibleAdd]);

    const categoriesTb = categories.map((category, index) => {
        return (
            <tr key={index}>
                <th>{category.id}</th>
                <th>{category.name}</th>
                <th>{category.code}</th>
                <th>
                    <Action edit={() => handleOpenPopup(category)} remove={() => handleOpenPopupDelete(category)} />
                </th>
            </tr>
        );
    });

    return (
        <div className={cx('category')}>
            <div className={cx('wrap-table')}>
                {visibleDelete && <DeletePopup data={visibleDelete} onclick={() => handleOpenPopupDelete(null)} />}
                {visibleEdit && <EditCategoryPopup data={visibleEdit} onclick={() => handleOpenPopup(null)} />}
                {visibleAdd && <AddPopup handleOpenAddPopup={handleOpenAddPopup} />}
                <div className={cx('header')}>
                    <p className={'content'}>
                        Table <b>Categories</b>
                    </p>
                    <Button color="blue" onclick={handleOpenAddPopup}>
                        Add Category
                    </Button>
                </div>
                <div className={cx('body')}>
                    <table className={cx('table-category')}>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Category</th>
                                <th>Category Code</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>{categoriesTb}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CategoryAd;
