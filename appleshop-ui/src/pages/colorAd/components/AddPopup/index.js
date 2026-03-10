import classNames from 'classnames/bind';
import styles from './Add.module.scss';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormGroup from '~/components/FormGroup';
import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import { createPortal } from 'react-dom';
import { ColorService } from '~/service/colorService';
const cx = classNames.bind(styles);

function AddPopup(props) {
    const { handleOpenAddPopup } = props;

    const schema = yup.object().shape({
        color: yup.string().required('Hãy nhập thêm màu sản phẩm'),
        code: yup.string().required('Hãy nhập mã màu sản phẩm'),
    });
    const {
        register,
        handleSubmit,
        // formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const fields = [
        {
            type: 'text',
            name: 'color',
            placeholder: 'Hãy thêm màu sản phẩm',
        },
        {
            type: 'text',
            name: 'code',
            placeholder: 'Hãy thêm mã màu sản phẩm',
        },
    ];

    const InputField = () => {
        return fields.map((field, index) => {
            return <FormGroup field={field} register={register} key={index} />;
        });
    };

    const handleClick = (e) => {
        e.stopPropagation();
    };
    const colorService = new ColorService();
    const onAdd = async (data) => {
        try {
            await colorService.add(data);
            handleOpenAddPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenAddPopup}>
                <div className={cx('add_popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Add Color</span>
                        <FaTimes className={cx('faTime')} onClick={handleOpenAddPopup} />
                    </div>
                    <form className={cx('body')} onSubmit={handleSubmit(onAdd)}>
                        <InputField />
                        <Button className={cx('test')} type="submit" size="" color="blue">
                            Add
                        </Button>
                    </form>
                </div>
            </div>
        </>,
        document.body,
    );
}

export default AddPopup;
