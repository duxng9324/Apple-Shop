import classNames from 'classnames/bind';
import styles from './AddMemory.module.scss';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormGroup from '~/components/FormGroup';
import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import { createPortal } from 'react-dom';
import { MemoryService } from '~/service/memoryService';
const cx = classNames.bind(styles);

function AddPopup(props) {
    const { handleOpenAddPopup } = props;

    const schema = yup.object().shape({
        type: yup.string().required('Hãy nhập thêm bộ nhớ'),
    });
    const {
        register,
        handleSubmit,
        // formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const field = {
        type: 'text',
        name: 'type',
        placeholder: 'Hãy thêm bộ nhớ vào đây',
    };

    const InputField = () => {
        return <FormGroup field={field} register={register} />;
    };

    const handleClick = (e) => {
        e.stopPropagation();
    };
    const memoryService = new MemoryService();
    const onAdd = async (data) => {
        try {
            await memoryService.add(data);
            handleOpenAddPopup();
        } catch (error) {}
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenAddPopup}>
                <div className={cx('add_popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Add Memory</span>
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
