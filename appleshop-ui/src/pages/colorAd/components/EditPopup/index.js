import { createPortal } from 'react-dom';
import classNames from 'classnames/bind';
import styles from './Editpopup.module.scss';
import * as yup from 'yup';
import FormGroup from '../../../../components/FormGroup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import { ColorService } from '~/service/colorService';

const cx = classNames.bind(styles);

function EditPopup(data) {
    const schema = yup.object().shape({
        color: yup.string().required('Hãy điền đầy đủ trường này'),
        code: yup.string().required('Hãy điền đầy đủ trường này'),
    });
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });

    const color = data.data;
    const handleOpenPopup = data.onclick;
    const fields = [
        {
            type: 'text',
            name: 'color',
            placeholder: 'Nhập màu vào đây',
            value: color.color,
        },
        {
            type: 'text',
            name: 'code',
            placeholder: 'Nhập màu vào đây',
            value: color.code,
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
    const colorservice = new ColorService();
    const onEdit = async (variableEdit) => {
        variableEdit.id = color.id;
        try {
            await colorservice.edit(variableEdit);
            handleOpenPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenPopup}>
                <div className={cx('popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Edit Color</span>
                        <FaTimes className={cx('faTime')} onClick={handleOpenPopup} />
                    </div>
                    <form className={cx('body')} onSubmit={handleSubmit(onEdit)}>
                        <InputField />
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

export default EditPopup;
