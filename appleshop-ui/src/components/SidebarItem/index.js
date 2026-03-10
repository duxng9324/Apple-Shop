import React from 'react';
import classNames from 'classnames/bind';
import styles from './ItemSidebar.module.scss';
import { NavLink } from 'react-router-dom';

const cx = classNames.bind(styles);

function SideBarItem(props) {
    const { iconLeft: IconLeft, iconRight: IconRight, to } = props;

    return (
        <NavLink className={(nav) => cx('itemSidebar', { active: nav.isActive })} to={to}>
            {IconLeft && <IconLeft className={cx('icon-left')} />}
            {props.children}
            {IconRight && <IconRight className={cx('icon-right')} />}
        </NavLink>
    );
}

export default SideBarItem;
