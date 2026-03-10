import classNames from 'classnames/bind';
import styles from './Add.module.scss';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormGroup from '~/components/FormGroup';
import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import { createPortal } from 'react-dom';
import { CategoryService } from '~/service/categoryService';
const cx = classNames.bind(styles);

function AddPopup(props) {
    const { handleOpenAddPopup } = props;

    const schema = yup.object().shape({
        name: yup.string().required('Hãy nhập tên thể loại'),
        code: yup.string().required('Hãy nhập mã thể loại'),
    });
    const {
        register,
        handleSubmit,
        // formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const fields = [
        {
            type: 'text',
            name: 'name',
            placeholder: 'Hãy thêm tên thể loại sản phẩm',
        },
        {
            type: 'text',
            name: 'code',
            placeholder: 'Hãy thêm mã thể loại sản phẩm',
        },
    ];

    const InputField = fields.map((field, index) => {
        return <FormGroup field={field} register={register} key={index} />;
    });

    const handleClick = (e) => {
        e.stopPropagation();
    };
    const categoryService = new CategoryService();
    const onAdd = async (data) => {
        try {
            await categoryService.add(data);
            handleOpenAddPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenAddPopup}>
                <div className={cx('add_popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Add Category</span>
                        <FaTimes className={cx('faTime')} onClick={handleOpenAddPopup} />
                    </div>
                    <form className={cx('body')} onSubmit={handleSubmit(onAdd)}>
                        {InputField}

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
