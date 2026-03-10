import classNames from 'classnames/bind';
import styles from './User.module.scss';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { AuthService } from '~/service/authService';
import { FaPencilAlt } from 'react-icons/fa';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

const cx = classNames.bind(styles);

function User() {
    const token = localStorage.getItem('token');
    const decode = jwt_decode(token);
    const userId = decode.id;
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const userService = new AuthService();
    const [user, setUser] = useState();

    const leftContainer = useRef(null);
    const rightContainerBt = useRef(null);
    const boxDelete = useRef(null);
    const boxChangePass = useRef(null);
    const navigate = useNavigate();
    const inputFileRef = useRef(null);

    useEffect(() => {
        const fetchData = async function () {
            const res = await userService.view({ userId });
            setUser(res);
            return res;
        };
        fetchData();
    }, [userId]);
    const show = cx('show');
    const show2 = cx('show2');
    const show3 = cx('show3');
    const OpenRight = () => {
        inputFileRef.current.value = null;
        boxChangePass.current.classList.remove(show3);
        boxDelete.current.classList.remove(show3);
        rightContainerBt.current.classList.add(show);
        leftContainer.current.classList.add(show2);
    };
    const OffRight = () => {
        rightContainerBt.current.classList.remove(show);
        leftContainer.current.classList.remove(show2);
    };

    const OpenBoxDelete = () => {
        boxChangePass.current.classList.remove(show3);
        leftContainer.current.classList.add(show2);
        rightContainerBt.current.classList.remove(show);
        boxDelete.current.classList.add(show3);
    };
    const OffBoxDelete = () => {
        leftContainer.current.classList.remove(show2);
        boxDelete.current.classList.remove(show3);
    };

    const OpenBoxChangePass = () => {
        rightContainerBt.current.classList.remove(show);
        boxDelete.current.classList.remove(show3);
        leftContainer.current.classList.add(show2);
        boxChangePass.current.classList.add(show3);
    };
    const OffBoxChangePass = () => {
        leftContainer.current.classList.remove(show2);
        boxChangePass.current.classList.remove(show3);
    };

    const DeleteAccount = async () => {
        try {
            await userService.remove({ userId });
            navigate('/login');
        } catch (error) {}
    };
    const inforSchema = yup.object().shape({
        address: yup.string(),
        fullName: yup.string().required('Đây là trường bắt buộc'),
        userName: yup.string().required('Đây là trường bắt buộc'),
        email: yup.string(),
        phone: yup.string(),
    });
    const {
        register: registerForm1,
        handleSubmit: handleSubmitForm1,
        formState: { errors: errorsForm1 },
        setValue: setValueForm1,
    } = useForm({
        resolver: yupResolver(inforSchema),
        shouldUnregister: true,
        defaultValues: {
            fullName: user?.fullName,
            userName: user?.userName,
        },
    });
    useEffect(() => {
        if (user) {
            setValueForm1('fullName', user.fullName);
            setValueForm1('userName', user.userName);
            setValueForm1('address', user.address);
            setValueForm1('phone', user.phone);
            setValueForm1('email', user.email);
            setValueForm2('password', '');
            setValueForm2('newPass', '');
            setValueForm2('confirmNewPass', '');
        }
    }, [user, setValueForm1]);
    const passwordSchema = yup.object().shape({
        password: yup.string().required('Đây là trường bắt buộc'),
        newPass: yup
            .string()
            .notOneOf([yup.ref('password')], 'Mật khẩu mới phải khác mật khẩu hiện tại')
            .min(6, 'Mật khẩu phải có ít nhất 6 kí tự')
            .required('Đây là trường bắt buộc'),
        confirmNewPass: yup
            .string()
            .oneOf([yup.ref('newPass'), null], 'Mật khẩu không khớp')
            .required('Đây là trường bắt buộc'),
    });

    const {
        register: registerForm2,
        handleSubmit: handleSubmitForm2,
        formState: { errors: errorsForm2 },
        setValue: setValueForm2,
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });
    const onPasswordSubmit = async (data) => {
        data.userName = user.userName;
        try {
            await userService.changePass(data);
            OffBoxChangePass();
            const res = await userService.view({ userId });
            setUser(res);
            toast.success('Đổi mật khẩu thành công', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        } catch (error) {
            if (error.response.data === 'Mật khẩu không chính xác')
                toast.error('Mật khẩu không chính xác', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                });
        }
    };

    const onInforSubmit = async (data) => {
        data.userId = userId;
        try {
            await userService.changeInfo(data);
            OffRight();
            const res = await userService.view({ userId });
            setUser(res);
            toast.success('Cập nhật thông tin thành công', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        } catch (error) {
            toast.error('Cập nhật thông tin thất bại', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
        }
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            axios
                .post(`http://localhost:8081/api/image/user/${userId}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                })
                .then(() => {})
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    return (
        <div className={cx('page-wr')}>
            <div className={cx('container')}>
                <ToastContainer />
                <div className={cx('page')}>
                    <div className={cx('left')} ref={leftContainer}>
                        <div className={cx('profile')}>
                            <div className={cx('cover')}></div>
                            <div
                                className={cx('avartar')}
                                style={
                                    selectedImage
                                        ? { backgroundImage: `url("${selectedImage}")` }
                                        : user?.images && { backgroundImage: `url("${user.images}")` }
                                }
                            ></div>
                        </div>
                        <div className={cx('profile_body')}>
                            <div className={cx('fullname')}>{user?.fullName}</div>
                            <div className={cx('wrap_button')}>
                                <div className={cx('username')}>{user?.userName}</div>
                                <div className={'edit'}>
                                    <Tippy content={'Sửa Thông Tin'} placement="right">
                                        <i>
                                            <FaPencilAlt onClick={() => OpenRight()} />
                                        </i>
                                    </Tippy>
                                </div>
                            </div>
                            <div className={cx('item')}>
                                <span className={cx('title')}>Address: </span>
                                <span className={cx('content')}>{user?.address ? user?.address : 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('item')}>
                                <span className={cx('title')}>Email: </span>
                                <span className={cx('content')}>{user?.email ? user?.email : 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('item')}>
                                <span className={cx('title')}>Tel: </span>
                                <span className={cx('content')}>{user?.phone ? user.phone : 'Chưa cập nhật'}</span>
                            </div>
                            <div className={cx('des')}>Mô tả vị trí vai trò</div>
                            <div className={cx('position')}>
                                {user?.role === 0 ? 'Người dùng' : 'Quản lý trang web'}
                            </div>
                            <div className={cx('btns')}>
                                <div className={cx('remove')} onClick={() => OpenBoxDelete()}>
                                    <div className={cx('deleteUser')}>Xóa tài khoản</div>
                                </div>
                                <div className={cx('editPasswpord')} onClick={() => OpenBoxChangePass()}>
                                    <div>Đổi Mật Khẩu</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cx('wrap-right')}>
                        <form
                            className={cx('right')}
                            ref={rightContainerBt}
                            onSubmit={handleSubmitForm1(onInforSubmit)}
                        >
                            <div className={cx('changeInf')}>
                                <label htmlFor="avatar" className={cx('center')}>
                                    Đổi thông tin cá nhân
                                </label>
                                <div className={cx('changeAvt')}>
                                    <input
                                        ref={inputFileRef}
                                        type="file"
                                        className={cx('choose')}
                                        id="avatar"
                                        name="avatar"
                                        accept="image/png, image/jpeg"
                                        onChange={(e) => {
                                            e.target.value && setSelectedImage(URL.createObjectURL(e.target.files[0]));
                                            handleFileChange(e);
                                        }}
                                    />
                                </div>
                                <div className={cx('changeName')}>
                                    <span>Đổi họ và tên</span>
                                    <input
                                        {...registerForm1('fullName')}
                                        defaultValue={user?.fullName}
                                        type="text"
                                        name="fullName"
                                        placeholder="Type your name"
                                    />
                                    <p className={cx('errors')}>{errorsForm1.fullName?.message}</p>
                                </div>
                                <div className={cx('changeUserName')}>
                                    <span>Đổi Username</span>
                                    <input
                                        {...registerForm1('userName')}
                                        defaultValue={user?.userName}
                                        type="text"
                                        name="userName"
                                        placeholder="Type your user name"
                                    />
                                    <p className={cx('errors')}>{errorsForm1.userName?.message}</p>
                                </div>
                                <div className={cx('changeAddress')}>
                                    <span>Đổi địa chỉ</span>
                                    <input
                                        {...registerForm1('address')}
                                        defaultValue={user?.address ? user?.address : null}
                                        type="text"
                                        name="address"
                                        placeholder="Type your address"
                                    />
                                </div>
                                <div className={cx('email')}>
                                    <span>Đổi email</span>
                                    <input
                                        {...registerForm1('email')}
                                        defaultValue={user?.email ? user?.email : null}
                                        type="text"
                                        name="email"
                                        placeholder="Type your email"
                                    />
                                </div>
                                <div className={cx('phone')}>
                                    <span>Đổi số điện thoại</span>
                                    <input
                                        {...registerForm1('phone')}
                                        defaultValue={user?.phone ? user?.phone : null}
                                        type="text"
                                        name="phone"
                                        placeholder="Type your phone"
                                    />
                                </div>

                                <div className={cx('wrap-btn')}>
                                    <button type="submit" className={cx('edit')}>
                                        <div>Cập nhật</div>
                                    </button>
                                    <div className={cx('cancel-dl')} onClick={() => OffRight()}>
                                        Hủy
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className={cx('popupdelete')} ref={boxDelete}>
                            <p className={cx('question')}>Bạn có chắc chắc muốn xóa tài khoản này?</p>
                            <p className={cx('warning')}>Hành động này không thể hoàn tác !</p>
                            <div className={cx('boxBtnPopup')}>
                                <div className={cx('confirm-dl')} onClick={() => DeleteAccount()}>
                                    Xác Nhận
                                </div>
                                <div className={cx('cancel-dl')} onClick={() => OffBoxDelete()}>
                                    Hủy
                                </div>
                            </div>
                        </div>
                        <div className={cx('boxChangePass')} ref={boxChangePass}>
                            <p className={cx('name')}>Đổi Mật Khẩu</p>
                            <form className={cx('boxInput')} onSubmit={handleSubmitForm2(onPasswordSubmit)}>
                                <input
                                    type="password"
                                    className={cx('password')}
                                    id="oldPass"
                                    name="password"
                                    placeholder="Nhập mật khẩu cũ"
                                    {...registerForm2('password')}
                                    defaultValue={''}
                                />
                                <p className={cx('errors')}>{errorsForm2.password?.message}</p>
                                <input
                                    type="password"
                                    className={cx('newPass')}
                                    id="newPass"
                                    name="newPass"
                                    placeholder="Nhập mật khẩu mới (>6 kí tự)"
                                    {...registerForm2('newPass')}
                                    defaultValue={''}
                                />
                                <p className={cx('errors')}>{errorsForm2.newPass?.message}</p>
                                <input
                                    type="password"
                                    className={cx('confirmNewPass')}
                                    id="confirmNewPass"
                                    name="confirmNewPass"
                                    placeholder="Nhập lại mật khẩu mới"
                                    {...registerForm2('confirmNewPass')}
                                    defaultValue={''}
                                />
                                <p className={cx('errors')}>{errorsForm2.confirmNewPass?.message}</p>
                                <div className={cx('boxBtnPopup')}>
                                    <button type="submit" className={cx('confirm-dl')}>
                                        Xác Nhận
                                    </button>
                                    <div className={cx('cancel-dl')} onClick={() => OffBoxChangePass()}>
                                        Hủy
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default User;
