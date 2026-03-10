import classNames from 'classnames/bind';
import styles from './ProductCartItem.module.scss';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { CartService } from '~/service/cartService';

const cx = classNames.bind(styles);

function ProductCartItem(props) {
    const { setItems, index, id, onRemove } = props;
    const { productDTO, color, quantity, memory } = props.props;
    const { colorDTOs, imgLinks, list } = productDTO;
    const link = imgLinks.split(' ');
    const priceReal = list.find((item) => item.type === memory).price;

    const [quantityItem, setQuantityItem] = useState(quantity);
    const [priceItem, setPriceItem] = useState(quantity * priceReal);
    const [colorSelect, setColorSelect] = useState(color);

    useEffect(() => {
        setPriceItem(quantityItem * priceReal);
    }, [quantityItem, priceReal]);

    useEffect(() => {
        setItems(index, quantityItem, colorSelect);
    }, [quantityItem, index, colorSelect]);

    const handleClickMinus = () => {
        if (quantityItem - 1 === 0) {
            setQuantityItem(1);
        } else {
            setQuantityItem(quantityItem - 1);
        }
    };
    const handleClickPlus = () => {
        setQuantityItem(quantityItem + 1);
    };

    const cartService = new CartService();
    const onDelete = async () => {
        try {
            await cartService.remove(id);
            onRemove();
        } catch (error) {}
    };
    const handleColorChange = (e) => {
        setColorSelect(e.target.value);
    };
    return (
        <div className={cx('item')}>
            <img className={cx('image')} src={link[0]} alt="Hình ảnh của sản phẩm" />
            <div className={cx('inside')}>
                <div className={cx('name')}>
                    {productDTO.name} {memory}
                </div>
                <select className={cx('color')} defaultValue={color} onChange={(e) => handleColorChange(e)}>
                    {colorDTOs.map((color, index) => {
                        return (
                            <option value={color.color} key={index}>
                                {color.color}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className={cx('quantity')}>
                <div className={cx('adjust')}>
                    <FaMinus onClick={() => handleClickMinus()} />
                    <div>{quantityItem}</div>
                    <FaPlus onClick={() => handleClickPlus()} />
                </div>
                <div className={cx('remove')} onClick={() => onDelete()}>
                    <FaTrash /> Xóa
                </div>
            </div>
            <div className={cx('price')}>
                <div className={cx('real')}>{priceItem.toLocaleString('vi-VN') + 'đ'}</div>
                <strike>{Math.floor(priceItem * 1.2).toLocaleString('vi-VN') + 'đ'}</strike>
            </div>
        </div>
    );
}

export default ProductCartItem;
