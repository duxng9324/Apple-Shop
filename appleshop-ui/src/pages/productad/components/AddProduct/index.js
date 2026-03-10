import classNames from 'classnames/bind';
import styles from './Addproduct.module.scss';
import { FaPlusCircle, FaTimes, FaTrashRestoreAlt } from 'react-icons/fa';
import Button from '~/components/Button';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormGroup from '~/components/FormGroup';
import { ProductService } from '~/service/productService';
import { useState } from 'react';

const cx = classNames.bind(styles);

function isMissingKey(objects, key) {
    if (!Array.isArray(objects)) {
        return false;
    }
    return objects.some((obj) => !(key in obj && obj[key] !== ''));
}
function AddPopup(props) {
    const { handleOpenAddPopup, categories, colors, memories } = props;

    const handleClick = (e) => {
        e.stopPropagation();
    };

    const schema = yup.object().shape({
        name: yup.string().required('Hãy điền đầy đủ trường này'),
        code: yup.string().required('Hãy điền đầy đủ trường này'),
        description: yup.string().required('Hãy điền đầy đủ trường này'),
        categoryCode: yup.string().required('Hãy điền đầy đủ trường này'),
        colors: yup.array().min(1).required(),
    });
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });

    const fields = [
        {
            type: 'text',
            name: 'name',
            placeholder: 'Nhập tên sản phẩm',
        },
        {
            type: 'text',
            name: 'code',
            placeholder: 'Nhập mã sản phẩm',
        },
        {
            type: 'text',
            name: 'description',
            placeholder: 'Nhập mô tả của sản phẩm',
        },
    ];
    const InputField = fields.map((field, index) => {
        return <FormGroup field={field} register={register} key={index} />;
    });
    //Category
    const Select = () => {
        return (
            <select {...register('categoryCode')}>
                {categories.map((category, index) => {
                    return (
                        <option value={category.code} key={index}>
                            {category.name}
                        </option>
                    );
                })}
            </select>
        );
    };

    //Color
    const ColorSelect = () => {
        return (
            <div className={cx('colorSelect')}>
                <span className={cx('title')}> Select list color for your product</span>
                {colors.map((color, index) => {
                    return (
                        <div className={cx('item-color')} id={index} key={index}>
                            <p>{color.color}</p>
                            <input type="checkbox" name="color" {...register('colors')} value={color.id} />
                        </div>
                    );
                })}
            </div>
        );
    };

    //Linkimage
    let images = [];
    const getLinkImg = (a) => {
        images = a.join(' ');
    };
    const ListImage = () => {
        const [val, setVal] = useState([]);

        const handleAdd = () => {
            const newVal = [...val];
            newVal.push('');
            setVal(newVal);
        };

        const handleChange = (onchangeValue, i) => {
            const inputData = [...val];
            inputData[i] = onchangeValue.target.value;
            setVal(inputData);
        };
        const handleDelete = (i) => {
            const defaultVal = [...val];
            defaultVal.splice(i, 1);
            setVal(defaultVal);
        };
        getLinkImg(val);
        return (
            <div className={cx('imageSelect')}>
                <span className={cx('title')}>Type link image for product</span>
                {val.map((data, index) => {
                    return (
                        <div className={cx('item-image')} key={index}>
                            <input
                                value={data}
                                type="text"
                                name={`imgLinks-${index}`}
                                placeholder="type link image for product"
                                onChange={(e) => handleChange(e, index)}
                            />
                            <FaTrashRestoreAlt color="red" onClick={() => handleDelete(index)} />
                        </div>
                    );
                })}
                <div className={cx('button-add')} onClick={() => handleAdd()}>
                    <span>add image</span>
                    <FaPlusCircle color="white" />
                </div>
            </div>
        );
    };

    const SelectMemoryPrice = () => {
        const [val, setVal] = useState([]);
        const [memoried, setMemoried] = useState([]);

        const handleMemoryChange = (e, index) => {
            const selectedMemoryType = e.target.value;

            // Check if the selected memory type is not already used in other items
            const isMemoryTypeAvailable =
                !memoried.includes(selectedMemoryType) || (memoried[index] && selectedMemoryType === memoried[index]);

            if (isMemoryTypeAvailable) {
                setMemoried((prevMemoried) => {
                    const newMemoried = [...prevMemoried];
                    newMemoried[index] = selectedMemoryType;
                    return newMemoried;
                });

                setVal((prevVal) => {
                    const newVals = [...prevVal];
                    newVals[index].type = selectedMemoryType;
                    return newVals;
                });
            } else {
                alert('This memory type is already used in another item!');
            }
        };

        const handleAdd = () => {
            // Get all available memory types
            const availableMemories = memories.filter((memory) => !memoried.includes(memory.type));

            // Check if there are available memory types
            if (availableMemories.length > 0) {
                // Create a new item with the first available memory type
                const newItem = {
                    type: availableMemories[0].type,
                    price: '',
                };

                // Update the state with the new item
                setVal((prevVal) => [...prevVal, newItem]);

                // Update the memoried array with the new memory type
                setMemoried((prevMemoried) => [...prevMemoried, newItem.type]);
            } else {
                alert('Tất cả phiên bản bộ nhớ của sản phẩm đã được thêm');
            }
        };
        const handleDelete = (i) => {
            setMemoried((prevMemoried) => {
                const newMemoried = [...prevMemoried];
                newMemoried.splice(i, 1);
                return newMemoried;
            });
            setVal((prevVal) => prevVal.filter((item, index) => index !== i));
        };
        const handlePriceChange = (e, index) => {
            const value = e.target.value;
            setVal((prevVal) => {
                const newVal = [...prevVal];
                newVal[index].price = value;
                return newVal;
            });
        };

        getList(val);

        return (
            <div className={cx('memoryPrice')}>
                <span className={cx('title')}>Price with Memory</span>
                <div className={cx('body')}>
                    {val.map((item, index) => (
                        <div className={cx('item')} key={item.type}>
                            <div className={cx('memory')}>
                                <span>Memory :</span>
                                <select value={item.type} onChange={(e) => handleMemoryChange(e, index)}>
                                    {memories.map((memory, i) => (
                                        <option
                                            value={memory.type}
                                            key={i}
                                            disabled={memoried.includes(memory.type) && memoried[index] !== memory.type}
                                        >
                                            {memory.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={cx('price')}>
                                <span>Price :</span>
                                <input
                                    defaultValue={item.price}
                                    type="number"
                                    placeholder="type price for product"
                                    onChange={(e) => handlePriceChange(e, index)}
                                />
                            </div>
                            <FaTrashRestoreAlt color="red" onClick={() => handleDelete(index)} />
                        </div>
                    ))}
                    <div className={cx('button-add')} onClick={() => handleAdd()}>
                        <span>add price and memory</span>
                        <FaPlusCircle color="white" />
                    </div>
                </div>
            </div>
        );
    };
    let check;
    const getList = (a) => {
        check = a;
    };
    const productService = new ProductService();
    const onAdd = async (data) => {
        if (isMissingKey(check, 'price') === false) {
            data.imgLinks = images;
            data.list = check;
            try {
                await productService.add(data);
                handleOpenAddPopup();
            } catch (error) {}
        } else {
            alert('Vui lòng điền đầy đủ giá tiền');
        }
    };

    return createPortal(
        <>
            <div className={cx('wrap_popup')} onClick={handleOpenAddPopup}>
                <div className={cx('add_popup')} onClick={(e) => handleClick(e)}>
                    <div className={cx('header')}>
                        <span>Add Information Product</span>
                        <FaTimes className={cx('faTime')} onClick={handleOpenAddPopup} />
                    </div>
                    <form className={cx('body')} onSubmit={handleSubmit(onAdd)}>
                        {InputField}
                        <p className={cx('select')}>Select a category for your product</p>
                        <Select />
                        <ColorSelect />
                        <ListImage />
                        <SelectMemoryPrice />
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
