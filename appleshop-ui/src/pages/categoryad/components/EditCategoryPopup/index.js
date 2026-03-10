import classNames from 'classnames/bind';
import styles from './EditCategoryPopup.module.scss';

import { FaTimes } from 'react-icons/fa';
import Button from '../../../../components/Button';
import { createPortal } from 'react-dom';
import * as yup from 'yup';
import FormGroup from '../../../../components/FormGroup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CategoryService } from '~/service/categoryService';

const cx = classNames.bind(styles);

function EditCategoryPopup(data) {
    const schema = yup.object().shape({
        name: yup.string().required('Hãy điền đầy đủ trường này'),
        code: yup.string().required('Hãy điền đầy đủ trường này'),
    });
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });

    const category = data.data;
    const handleOpenPopup = data.onclick;
    const fields = [
        {
            type: 'text',
            name: 'name',
            placeholder: 'Chỉnh sửa thông tin thể loại sản phẩm',
            value: category.name,
        },
        {
            type: 'text',
            name: 'code',
            placeholder: 'Chỉnh sửa mã thể loại sản phẩm',
            value: category.code,
        },
    ];
    const InputField = fields.map((field, index) => {
        return <FormGroup field={field} register={register} key={index} />;
    });

    const handleClick = (e) => {
        e.stopPropagation();
    };
    const categoryService = new CategoryService();
    const onEdit = async (variableEdit) => {
        variableEdit.id = category.id;
        try {
            await categoryService.edit(variableEdit);
            handleOpenPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenPopup}>
                <div className={cx('popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Edit Category</span>
                        <FaTimes className={cx('faTime')} onClick={handleOpenPopup} />
                    </div>
                    <form className={cx('body')} onSubmit={handleSubmit(onEdit)}>
                        {InputField}
                        <Button type="submit" size="" color="green">
                            Edit
                        </Button>
                    </form>
                </div>
            </div>
        </>,
        document.body,
    );
}
export default EditCategoryPopup;
