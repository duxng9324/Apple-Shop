import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { AuthService } from '~/service/authService';

import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const cx = classNames.bind(styles);

function Login() {
    const navigate = useNavigate();
    const schema = yup.object().shape({
        userName: yup.string().required('Hãy điền đầy đủ tên đăng nhập của bạn'),
        password: yup.string().required('Hãy điền mật khẩu của bạn'),
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const authService = new AuthService();
    // const values = {
    //     userName: '',
    //     password: '',
    // };
    // schema
    //     .validate(values)
    //     .then(() => {
    //         // Không có lỗi
    //     })
    //     .catch((errors) => {
    //         if (errors.inner.some((error) => error.path === 'userName')) {
    //             console.log(errors.inner.find((error) => error.path === 'userName').message);
    //         }
    //         if (errors.inner.some((error) => error.path === 'password')) {
    //             console.log(errors.inner.find((error) => error.path === 'password').message);
    //         }
    //     });
    const onLogin = async (data) => {
        try {
            const token = await authService.register2(data);
            toast.success('Đăng nhập thành công', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
            localStorage.setItem('token', token);
            const decoded = jwt_decode(token);
            setTimeout(() => {
                if (decoded.role === 1) navigate('/admin');
                else {
                    navigate('/');
                }
            }, 3000);
        } catch (error) {
            if (error.response.data === 'Tên người dùng không tồn tại') {
                toast.error('Tên người dùng không tồn tại', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                });
            } else if (error.response.data === 'Mật khẩu không chính xác') {
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
            } else {
                toast.error('Đã có lỗi xảy ra vui lòng thử lại sau!', {
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
        }
    };

    return (
        <div className={cx('login')}>
            <ToastContainer />
            <form className={cx('wrapper')} onSubmit={handleSubmit(onLogin)}>
                <img className={cx('lg-login')} src={require('~/assets/image/login.png')} alt={'myimage'} />
                <div className={cx('username')}>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder={'Tài khoản'}
                        className={cx('login-input')}
                        {...register('userName')}
                    />
                    <p className={cx('error')}>{errors.userName?.message}</p>
                </div>
                <div className={cx('password')}>
                    <input
                        type="password"
                        name="pass"
                        id="pass"
                        placeholder={'Mật khẩu'}
                        className={cx('login-input')}
                        {...register('password')}
                    />
                    <p className={cx('error')}>{errors.password?.message}</p>
                </div>
                <div className={cx('wrap-btn')}>
                    <button className={cx('forgot')}>Quên mật khẩu ?</button>
                </div>
                <div className={cx('wrapper')}>
                    <button className={cx('btn-login')}>
                        <span>Đăng nhập</span>
                    </button>
                </div>
            </form>
            <div className={cx('question')}>
                <span>Bạn chưa có tài khoản ?</span>
                <Link to="/signup" className={cx('not-account')}>
                    Đăng kí miễn phí
                </Link>
            </div>
        </div>
    );
}

export default Login;
