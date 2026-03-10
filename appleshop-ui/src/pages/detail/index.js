import classNames from 'classnames/bind';
import styles from './Detail.module.scss';
import { useNavigate, useParams } from 'react-router-dom';

import { ProductService } from '~/service/productService';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './swipper.scss';
import { FaChevronCircleDown, FaMemory, FaMoneyBillWave, FaPaperPlane } from 'react-icons/fa';
import jwt_decode from 'jwt-decode';
import { CartService } from '~/service/cartService';
import RatingStars from '~/components/RenderStar';
import { CommentService } from '~/service/commentService';

const cx = classNames.bind(styles);

function Detail() {
    const { productCode } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState([]);
    const [priceSelect, setPriceSelect] = useState(0);
    const [colorSelect, setColorSelect] = useState(0);
    const [cart, setCart] = useState({});
    const [check, setCheck] = useState(false);
    const [isLoading, setIsLoading] = useState();

    useEffect(() => {
        const cartService = new CartService();
        const fetchData = async function () {
            const res = await cartService.add(cart);
            return res;
        };
        if (check) {
            fetchData().then(() => navigate('/cart'));
        }
    }, [cart]);

    useEffect(() => {
        const productService = new ProductService();
        const fetchData = async function () {
            const res = await productService.viewProductByCode({ productCode });
            setProduct(res);
            return res;
        };
        fetchData();
    }, [productCode, isLoading]);
    const { imgLinks, name, list, colorDTOs, commentDTOs } = product;
    const imageArray = imgLinks ? imgLinks.split(' ') : '';

    const commentService = new CommentService();
    const deleteComment = async (id) => {
        await commentService.remove(id);
        setIsLoading(!isLoading);
    };
    const deleteReply = async (id) => {
        await commentService.removeReply(id);
        setIsLoading(!isLoading);
    };

    const SwipperImage = () => {
        return (
            <>
                <Swiper
                    spaceBetween={30}
                    centeredSlides={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                >
                    {imageArray !== '' &&
                        imageArray.map((item, index) => {
                            return (
                                <SwiperSlide key={index}>
                                    <img src={item} alt="Hình ảnh sản phẩm" />
                                </SwiperSlide>
                            );
                        })}
                </Swiper>
            </>
        );
    };
    const token = localStorage.getItem('token');
    const decoded = jwt_decode(token);
    const OnBuy = () => {
        const token = localStorage.getItem('token');
        const decoded = jwt_decode(token);
        const item = {
            userId: decoded.id,
            productId: product.id,
            memory: list?.[priceSelect]?.type,
            color: colorDTOs?.[colorSelect]?.color,
        };
        setCart(item);
        setCheck(true);
    };

    function calculateAverageRating(commentDTOs) {
        if (commentDTOs.length === 0) {
            return 0;
        }

        const totalRating = commentDTOs.reduce((sum, comment) => {
            return sum + comment.rating;
        }, 0);

        const averageRating = totalRating / commentDTOs.length;
        return Math.round(averageRating);
    }

    function calculateElapsedTime(timeCmt) {
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - timeCmt;

        const millisecondsInMinute = 60 * 1000;
        const minutesDifference = Math.floor(timeDifference / millisecondsInMinute);

        if (minutesDifference < 1) {
            const millisecondsInSeconds = 1000;
            const secondsDifference = Math.floor(timeDifference / millisecondsInSeconds);
            return `${Math.max(secondsDifference, 0)} giây trước`;
        } else if (minutesDifference < 60) {
            return `${Math.max(minutesDifference, 0)} phút trước`;
        } else if (minutesDifference < 1440) {
            const hoursDifference = Math.floor(minutesDifference / 60);
            return `${Math.max(hoursDifference, 0)} giờ trước`;
        } else {
            const daysDifference = Math.floor(minutesDifference / 1440);
            return `${Math.max(daysDifference, 0)} ngày trước`;
        }
    }

    const [isEdit, setIsEdit] = useState(false);
    const handlEdit = (str) => {
        setIsEdit(true);
        setReplyAd(str);
    };
    const handlEditOff = async (id) => {
        setIsEdit(false);
        if (decoded.role === 1) {
            const reply = replyAd;
            const adminId = decoded.id;
            await commentService.changeRep({ id, reply, adminId });
            setIsLoading(!isLoading);
        } else {
            const comment = replyAd;
            await commentService.changeCmt({ id, comment });
            setIsLoading(!isLoading);
        }
    };
    const [replyAd, setReplyAd] = useState('');
    const handdleChangeComment = (e) => {
        setReplyAd(e.target.value);
    };

    const handleSendCmt = async (id) => {
        const adminId = decoded.id;
        const reply = replyAd;
        if (reply !== '') {
            await commentService.addRep({ id, reply, adminId });
            setIsLoading(!isLoading);
        }
    };
    const handleEditCmtAdChange = (e) => {
        setReplyAd(e.target.value);
    };
    return (
        <div className={cx('container')}>
            <div className={cx('detail')}>
                <div className={cx('left')}>
                    <SwipperImage />
                </div>
                <div className={cx('right')}>
                    <div className={cx('name')}>{name}</div>
                    <div className={cx('price')}>
                        <div className={cx('wrap-price')}>
                            <span className={cx('real_price')}>
                                {list?.[priceSelect]?.price.toLocaleString('vi-VN') + ' VNĐ'}
                            </span>
                            <strike className={cx('brick_price')}>
                                {Math.floor(list?.[priceSelect]?.price * 1.2).toLocaleString('vi-VN') + ' vnđ'}
                            </strike>
                        </div>
                        <div className={cx('installment')}>
                            <p> Trả góp chỉ từ</p>
                            <strong className={cx('installment-price')}>
                                {Math.floor(list?.[priceSelect]?.price * 0.05).toLocaleString('vi-VN') + ' vnđ/1 tháng'}
                            </strong>
                        </div>
                    </div>
                    <div className={cx('memoryAndPrice')}>
                        {list &&
                            list.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={cx('item', index === priceSelect ? 'active' : '')}
                                        onClick={() => setPriceSelect(index)}
                                    >
                                        <div className={cx('item-pl')}>
                                            <FaMemory className={cx('icon')} />
                                            <p>{item.type}</p>
                                        </div>
                                        <div className={cx('item-pl')}>
                                            <FaMoneyBillWave className={cx('icon')} />
                                            <p>{item.price.toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className={cx('listColor')}>
                        {colorDTOs &&
                            colorDTOs.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={cx('item', index === colorSelect ? 'active' : '')}
                                        onClick={() => {
                                            setColorSelect(index);
                                        }}
                                    >
                                        <div className={cx('color')} style={{ backgroundColor: item.code }}>
                                            <p> </p>
                                        </div>
                                        <div className={cx('color_name')} style={{ color: item.code }}>
                                            {item.color}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div
                        className={cx('btn-buynow', decoded.role !== 0 ? 'disabled' : '')}
                        onClick={decoded.role !== 0 ? null : () => OnBuy()}
                        style={{ opacity: decoded.role !== 0 ? 0.5 : 1 }}
                    >
                        MUA NGAY
                    </div>

                    <div className={cx('contact')}>
                        <p>
                            Gọi <a href="tel:18006601">1800 6601</a> để được tư vấn mua hàng (Miễn phí)
                        </p>
                    </div>
                </div>
            </div>
            <div className={cx('description')}>{product.description}</div>
            {commentDTOs?.length > 0 && (
                <div className={cx('box-review')}>
                    <div className={cx('rating')}>
                        <p>Đánh giá trung bình</p>
                        <p className={cx('rating_avg')}>{calculateAverageRating(commentDTOs)}/5</p>
                        <RatingStars averageRating={calculateAverageRating(commentDTOs)} />
                        <p className={cx('count')}>{commentDTOs.length} đánh giá</p>
                    </div>
                    <div className={cx('comment')}>
                        {commentDTOs?.map((comment, index) => {
                            const { rating, adminName, reply, id, user, userName } = comment;
                            return (
                                <div className={cx('comment_item')} key={index}>
                                    <div className={cx('comment_user')}>
                                        <div
                                            className={cx('avartar')}
                                            style={{ backgroundImage: user?.images && `url("${user.images}")` }}
                                        ></div>
                                        <div className={cx('comment_user-content')}>
                                            <div className={cx('head')}>
                                                <div className={cx('username')}>{userName}</div>
                                                <div className={cx('checked')}>
                                                    <FaChevronCircleDown /> Đã mua hàng tại Studio
                                                </div>
                                            </div>
                                            <div className={cx('star')}>
                                                <RatingStars averageRating={rating} />
                                            </div>
                                            <input
                                                disabled={!isEdit}
                                                id={`comment_user${id}`}
                                                key={index}
                                                className={cx('content')}
                                                defaultValue={comment.comment}
                                                onChange={(e) => handdleChangeComment(e)}
                                                onBlur={() => handlEditOff(id)}
                                            />
                                            <div className={cx('feature_user')}>
                                                <div className={cx('time')}>
                                                    {calculateElapsedTime(comment.timeCmt)}
                                                </div>
                                                {decoded.role === 0 && decoded.username === userName && (
                                                    <label htmlFor={`comment_user${id}`}>
                                                        <div
                                                            onClick={() => handlEdit(comment.comment)}
                                                            className={cx('ft')}
                                                        >
                                                            Chỉnh sửa
                                                        </div>
                                                    </label>
                                                )}
                                                {(decoded.role === 1 || decoded.username === userName) && (
                                                    <div onClick={() => deleteComment(id)} className={cx('ft')}>
                                                        Xóa
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {reply && (
                                        <div className={cx('comment_admin')}>
                                            <div className={cx('avartar_admin')}></div>
                                            <div className={cx('comment_admin-content')}>
                                                <div className={cx('username')}>
                                                    <p>{adminName}</p>
                                                    <p className={cx('role')}>Quản trị viên</p>
                                                </div>

                                                <input
                                                    id={`reply${id}`}
                                                    key={id}
                                                    disabled={!isEdit}
                                                    className={cx('content')}
                                                    defaultValue={reply}
                                                    onChange={(e) => handleEditCmtAdChange(e)}
                                                    onBlur={() => handlEditOff(id)}
                                                />
                                                {decoded.role === 1 && decoded.username === adminName && (
                                                    <div className={cx('feature_admin')}>
                                                        <div className={cx('time')}>
                                                            {calculateElapsedTime(comment.timeRep)}
                                                        </div>
                                                        <label htmlFor={`reply${id}`}>
                                                            <div onClick={() => handlEdit(reply)} className={cx('ft')}>
                                                                Chỉnh sửa
                                                            </div>
                                                        </label>
                                                        <div onClick={() => deleteReply(id)} className={cx('ft')}>
                                                            Xóa
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(reply === '' || reply === null) && decoded.role === 1 && (
                                        <div className={cx('type_rep')}>
                                            <input
                                                type="text"
                                                className={cx('admin_rep')}
                                                placeholder="Nhập câu trả lời của bạn"
                                                onChange={(e) => handdleChangeComment(e)}
                                            />
                                            <FaPaperPlane onClick={() => handleSendCmt(id)} className={cx('send')} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Detail;
