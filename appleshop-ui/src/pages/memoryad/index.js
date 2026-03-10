import classNames from 'classnames/bind';
import styles from './Memory.module.scss';
import { useEffect, useState } from 'react';
import { MemoryService } from '~/service/memoryService';
import Action from '~/components/Action';
import Button from '~/components/Button';
import { AddPopup, DeletePopup, EditPopup } from './components';

const cx = classNames.bind(styles);

function MemoryAd() {
    const [memories, setMemories] = useState([]);
    const [rowMemory, setRowMemory] = useState();
    const [rowDelete, setRowDelete] = useState();

    const [visibleAdd, setVisibleAdd] = useState(false);
    const visibleEdit = rowMemory ? rowMemory : null;
    const visibleDelete = rowDelete ? rowDelete : null;

    //popupEdit
    const handleOpenPopup = (memory) => {
        setRowMemory(memory);
    };

    //Popup Delete
    const handleOpenPopupDelete = (category) => {
        setRowDelete(category);
    };

    //popup add
    const handleOpenAddPopup = () => {
        setVisibleAdd(!visibleAdd);
    };

    useEffect(() => {
        const memroryService = new MemoryService();
        const fetchData = async function () {
            const res = await memroryService.view();
            setMemories(res);
        };
        fetchData();
    }, [rowMemory, rowDelete, visibleAdd]);

    const memoriesTb = memories.map((memory, index) => {
        return (
            <tr key={index}>
                <th>{memory.id}</th>
                <th>{memory.type}</th>
                <th>
                    <Action edit={() => handleOpenPopup(memory)} remove={() => handleOpenPopupDelete(memory)} />
                </th>
            </tr>
        );
    });

    return (
        <div className={cx('memory')}>
            <div className={cx('wrap-table')}>
                {visibleDelete && <DeletePopup data={visibleDelete} onclick={() => handleOpenPopupDelete(null)} />}
                {visibleEdit && <EditPopup data={visibleEdit} onclick={() => handleOpenPopup(null)} />}
                {visibleAdd && <AddPopup handleOpenAddPopup={handleOpenAddPopup} />}
                <div className={cx('header')}>
                    <p className={'content'}>
                        Table <b>Memory</b>
                    </p>
                    <Button color="blue" onclick={handleOpenAddPopup}>
                        Add Memory
                    </Button>
                </div>
                <div className={cx('body')}>
                    <table className={cx('table-memory')}>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>{memoriesTb}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MemoryAd;
