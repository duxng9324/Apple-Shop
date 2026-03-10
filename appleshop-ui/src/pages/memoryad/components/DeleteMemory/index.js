import { FaTimes } from 'react-icons/fa';
import Button from '~/components/Button';
import classNames from 'classnames/bind';
import styles from './Deletememory.module.scss';
import { createPortal } from 'react-dom';
import { MemoryService } from '~/service/memoryService';

const cx = classNames.bind(styles);

function DeletePopup(props) {
    const { data, onclick } = props;
    const handleOpenPopupDelete = onclick;
    const memoryService = new MemoryService();
    const onDelete = async () => {
        try {
            await memoryService.remove(data);
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
                        <span>Delete Memory</span>
                        <FaTimes className={cx('faTime')} onClick={() => handleOpenPopupDelete()} />
                    </div>
                    <div className={cx('delete_popup-body')}>
                        <p className={cx('question')}>
                            Are you sure want to delele <b>{data.type}</b> ?
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
