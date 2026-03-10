import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import { CategoryService } from '~/service/categoryService';
import classNames from 'classnames/bind';
import styles from './DeletePopup.module.scss';
import { createPortal } from 'react-dom';

const cx = classNames.bind(styles);

function DeletePopup(props) {
    const { data, onclick } = props;
    const handleOpenPopupDelete = onclick;
    const categoryService = new CategoryService();
    const onDelete = async () => {
        try {
            await categoryService.remove(data);
            handleOpenPopupDelete();
        } catch (error) {}
    };
    const handleClick = (e) => {
        e.stopPropagation();
    };
    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={() => handleOpenPopupDelete()}>
                <div className={cx('delete_popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('delete_popup-header')}>
                        <span>Delete Category</span>
                        <FaTimes className={cx('faTime')} onClick={() => handleOpenPopupDelete()} />
                    </div>
                    <div className={cx('delete_popup-body')}>
                        <p className={cx('question')}>
                            Are you sure want to delele <b>{data.name}</b> ?
                        </p>
                        <p className={cx('warning')}>This action cannot be undo !!!</p>
                    </div>
                    <div className={cx('delete_popup-footer')}>
                        <Button onclick={onDelete} size="" color="red">
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </>,
        document.body,
    );
}

export default DeletePopup;
