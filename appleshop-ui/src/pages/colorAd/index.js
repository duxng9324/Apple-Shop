import classNames from 'classnames/bind';
import styles from './Color.module.scss';
import Action from '~/components/Action';
import Button from '~/components/Button';
import { AddPopup, DeletePopup, EditPopup } from './components';

import { useEffect, useState } from 'react';
import { ColorService } from '~/service/colorService';

const cx = classNames.bind(styles);

function ColorAd() {
    const [colors, setColors] = useState([]);
    const [rowColor, setRowColor] = useState(); // select row edit
    const [rowDelete, setRowDelete] = useState();

    const [visibleAdd, setVisibleAdd] = useState(false);
    const visibleDelete = rowDelete ? rowDelete : null;
    const visibleEdit = rowColor ? rowColor : null;

    //popupEdit
    const handleOpenPopup = (color) => {
        setRowColor(color);
    };

    //Popup Delete
    const handleOpenPopupDelete = (color) => {
        setRowDelete(color);
    };

    //popup add
    const handleOpenAddPopup = () => {
        setVisibleAdd(!visibleAdd);
    };

    useEffect(() => {
        const colorService = new ColorService();
        const fetchData = async function () {
            const res = await colorService.view();
            setColors(res);
        };
        fetchData();
    }, [rowColor, rowDelete, visibleAdd]);

    const colorsTb = colors.map((color, index) => {
        return (
            <tr key={index}>
                <th>{color.id}</th>
                <th>{color.color}</th>
                <th>{color.code}</th>
                <th>
                    <Action edit={() => handleOpenPopup(color)} remove={() => handleOpenPopupDelete(color)} />
                </th>
            </tr>
        );
    });

    return (
        <div className={cx('color')}>
            <div className={cx('wrap-table')}>
                {visibleDelete && <DeletePopup data={visibleDelete} onclick={() => handleOpenPopupDelete(null)} />}
                {visibleEdit && <EditPopup data={visibleEdit} onclick={() => handleOpenPopup(null)} />}
                {visibleAdd && <AddPopup handleOpenAddPopup={handleOpenAddPopup} />}
                <div className={cx('header')}>
                    <p className={'content'}>
                        Table <b>Color</b>
                    </p>
                    <Button color="blue" onclick={handleOpenAddPopup}>
                        Add Color
                    </Button>
                </div>
                <div className={cx('body')}>
                    <table className={cx('table-color')}>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Color</th>
                                <th>Code</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>{colorsTb}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ColorAd;
