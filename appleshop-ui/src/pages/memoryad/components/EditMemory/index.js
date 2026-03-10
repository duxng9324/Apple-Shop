import { createPortal } from 'react-dom';
import classNames from 'classnames/bind';
import styles from './Edit.module.scss';
import * as yup from 'yup';
import FormGroup from '../../../../components/FormGroup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaTimes } from 'react-icons/fa';
import { MemoryService } from '~/service/memoryService';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

function EditPopup(data) {
    const schema = yup.object().shape({
        type: yup.string().required('Hãy điền đầy đủ trường này'),
    });
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });

    const memory = data.data;
    const handleOpenPopup = data.onclick;
    const field = {
        type: 'text',
        name: 'type',
        placeholder: 'Chỉnh sửa thông tin bộ nhớ',
        value: memory.type,
    };
    const InputField = () => {
        return <FormGroup field={field} register={register} />;
    };

    const handleClick = (e) => {
        e.stopPropagation();
    };
    const memoryservice = new MemoryService();
    const onEdit = async (variableEdit) => {
        variableEdit.id = memory.id;
        try {
            await memoryservice.edit(variableEdit);
            handleOpenPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenPopup}>
                <div className={cx('popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Edit Memory</span>
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
