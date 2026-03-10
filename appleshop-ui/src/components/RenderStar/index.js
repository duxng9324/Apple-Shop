import React from 'react';
import classNames from 'classnames/bind';
import styles from './RenderStar.module.scss';
import { FaStar } from 'react-icons/fa';

const cx = classNames.bind(styles);

const RatingStars = ({ averageRating }) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const starClass = cx('star', { 'star-filled': i <= averageRating });
            stars.push(
                <li key={i} className={starClass}>
                    {' '}
                    <FaStar />
                </li>,
            );
        }
        return stars;
    };

    return (
        <div>
            <ul className={cx('stars-list')}>{renderStars()}</ul>
        </div>
    );
};

export default RatingStars;
