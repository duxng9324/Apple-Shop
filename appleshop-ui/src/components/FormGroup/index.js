import classNames from 'classnames/bind';
import styles from './Form.module.scss';

const cx = classNames.bind(styles);

function FormGroup(props) {
    const { register, field } = props;
    const { type, name, placeholder, value, className } = field;
    return (
        <div>
            <label className={cx('label')} htmlFor={name}>
                {name}
            </label>
            <input
                className={cx(className)}
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={value}
                {...register(name)}
            ></input>
        </div>
    );
}

export default FormGroup;
