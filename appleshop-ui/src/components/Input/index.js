import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.scss';

const cx = classNames.bind(styles);

function Input(props) {
    const { type, name, placeholder, value, className } = props.props;
    const [input, setInput] = useState(value);

    const handleTypeInput = (e) => {
        setInput(e.target.value);
    };
    return (
        <input
            className={cx(className)}
            id={name}
            type={type}
            value={input}
            name={name}
            placeholder={placeholder}
            onChange={handleTypeInput}
        ></input>
    );
}

export default Input;
