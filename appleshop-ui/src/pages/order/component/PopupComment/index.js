import classNames from 'classnames/bind';
import styles from './PopupComment.module.scss';
import Button from '~/components/Button';
import { FaStar, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import { CommentService } from '~/service/commentService';
import { OrderService } from '~/service/orderService';

const cx = classNames.bind(styles);

function PopupComment(props) {
    const { listProduct, userId, orderId } = props.props;
    const close = props.remove;
    const loading = props.loading;
    const [productRatings, setProductRatings] = useState({});
    const [validForm, setValidForm] = useState(true);

    const handleStarClick = (productId, starIndex) => {
        setProductRatings((prevRatings) => ({
            ...prevRatings,
            [productId]: starIndex,
        }));
    };

    const handleComplete = () => {
        const comments = [];

        let isFormValid = true;
        const commentService = new CommentService();
        const orderService = new OrderService();
        listProduct.forEach((product) => {
            const { id, name } = product;
            const rating = productRatings[id] || 1;
            const commentValue = document.getElementById(`comment-${id}`).value.trim();

            if (commentValue === '') {
                isFormValid = false;
                document.getElementById(`comment-${id}`).classList.add(cx('error'));
            } else {
                comments.push({
                    rating: rating,
                    comment: commentValue,
                    userId: userId,
                    productName: name,
                });
                document.getElementById(`comment-${id}`).classList.remove(cx('error'));
            }
        });

        if (isFormValid) {
            setValidForm(true);
            comments.map((comment) => {
                const fetchData = async function () {
                    const res = await commentService.add(comment);
                    return res;
                };
                fetchData();
            });
            const fetchData = async () => {
                const res = await orderService.changeCheckOrder({ orderId });
                return res;
            };
            fetchData();
            close();
            loading();
        } else {
            setValidForm(false);
        }
    };
    return createPortal(
        <>
            <div className={cx('wrap')}>
                <div className={cx('popup')}>
                    <div className={cx('header')}>
                        <p className={cx('title')}> Đánh giá sản phẩm</p>
                        <FaTimes onClick={close} />
                    </div>
                    <div className={cx('body')}>
                        <div className={cx('list')}>
                            {listProduct.map((product, index) => {
                                const { image, name, id } = product;
                                const productRating = productRatings[id] || 1;
                                return (
                                    <div className={cx('item')} key={index}>
                                        <div className={cx('product')}>
                                            <img src={image} alt="Hình ảnh của sản phẩm" />
                                            <p className={cx('product_name')}>{name}</p>
                                        </div>
                                        <ul className="rating">
                                            {Array(5)
                                                .fill(0)
                                                .map((_, starIndex) => (
                                                    <li
                                                        key={starIndex}
                                                        onClick={() => handleStarClick(id, starIndex + 1)}
                                                    >
                                                        <FaStar
                                                            className={starIndex < productRating ? cx('yellow') : ''}
                                                        />
                                                    </li>
                                                ))}
                                        </ul>
                                        <textarea
                                            id={`comment-${id}`}
                                            maxLength={2000}
                                            type="text"
                                            className={cx('comment')}
                                        />
                                    </div>
                                );
                            })}
                            <div className={cx('btn')}>
                                <Button color="#32373d" onclick={handleComplete}>
                                    Hoàn tất
                                </Button>
                            </div>
                            {!validForm && <p className={cx('error-message')}>Vui lòng đánh giá tất cả các sản phẩm</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
}

export default PopupComment;
