import classNames from 'classnames/bind';
import styles from './Signup.module.scss';
import { GgIcon } from '~/components/icon';
import { AuthService } from '~/service/authService';

import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const cx = classNames.bind(styles);

function SignUp() {
    let fail = '';
    let success;

    const notify = () => {
        if (success) {
            toast.success('Đăng kí thành công', {
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
            toast.error(fail, {
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

    const schema = yup.object().shape({
        fullName: yup.string().required('Hãy điền đầy đủ họ tên của bạn'),
        userName: yup.string().required('Hãy điền tên đăng nhập'),
        confirmPassword: yup
            .string()
            .required('Vui lòng nhập trường này')
            .oneOf([yup.ref('password'), null], 'Xác nhận mật khẩu thất bại'),
        password: yup
            .string()
            .required('Mật khẩu không được bỏ trống')
            .min(4, 'Mật khẩu phải có ít nhất 4 kí tự')
            .max(20, 'Mật khẩu chỉ có tối đa 20 kí tự'),
        agreed: yup.boolean().oneOf([true], 'Vui lòng xác nhận').required(),
    });

    // const values = {
    //     fullName: '',
    //     userName: '',
    //     password: '',
    // };

    // schema
    //     .validate(values)
    //     .then(() => {
    //         // Không có lỗi
    //     })
    //     .catch((errors) => {
    //         if (errors.inner.some((error) => error.path === 'fullName')) {
    //             console.log(errors.inner.find((error) => error.path === 'fullName').message);
    //         }
    //         if (errors.inner.some((error) => error.path === 'userName')) {
    //             console.log(errors.inner.find((error) => error.path === 'userName').message);
    //         }
    //         if (errors.inner.some((error) => error.path === 'password')) {
    //             console.log(errors.inner.find((error) => error.path === 'password').message);
    //         }
    //     });
    const authService = new AuthService();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const onSignup = async (data) => {
        try {
            success = true;
            await authService.register(data);
            setTimeout(() => {
                window.location.href = `/login`;
            }, 3000);
        } catch (error) {
            success = false;
            if (error.response && error.response.status === 400) {
                fail = 'Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác';
            } else {
                fail = 'Đã có lỗi xảy ra. Vui lòng thử lại sau';
            }
        }
        notify();
    };
    return (
        <div className={cx('signup')}>
            <ToastContainer />
            <div className={cx('wrapper')}>
                <div className={cx('left')}>
                    <img className={cx('apple-lg')} src={require('~/assets/image/apple-logo.png')} alt="applelogo" />
                    <p className={cx('title')}>Tạo tài khoản</p>
                    <img
                        className={cx('signup-img')}
                        src={require('~/assets/image/signup-img.png')}
                        alt="myimagesignup"
                    />
                </div>
                <div className={cx('right')}>
                    <div className={cx('head-form')}>Việt Nam</div>

                    <form className={cx('form')} noValidate onSubmit={handleSubmit(onSignup)}>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Tên đầy đủ"
                            className={cx('full-name', 'input-signup', { errors: errors.fullName?.message })}
                            {...register('fullName')}
                        />

                        <input
                            type="text"
                            name="userName"
                            placeholder="Tên đăng nhập"
                            className={cx('user-name', 'input-signup', {
                                errors: errors.userName?.message || fail,
                            })}
                            {...register('userName')}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu (4-20 kí tự)"
                            className={cx('password', 'input-signup', { errors: errors.password?.message })}
                            {...register('password')}
                        />

                        <input
                            type="password"
                            name="Cfpassword"
                            placeholder="Xác nhận mật khẩu"
                            minLength={'3'}
                            className={cx('confirm-password', 'input-signup', {
                                errors: errors.confirmPassword?.message,
                            })}
                            {...register('confirmPassword')}
                        />

                        <div className={cx('confirm-box', { errors: errors.agreed?.message })}>
                            <input
                                type="checkbox"
                                name="agreed"
                                defaultValue={true}
                                className={cx('agreed')}
                                {...register('agreed')}
                            />
                            <span className={cx('iagree')}>Tôi đồng ý với điều khoản dịch vụ và bảo mật</span>
                        </div>

                        <button type="submit" className={cx('btn-signup')}>
                            Đăng Ký
                        </button>
                        <div className={cx('or')}>Or</div>
                        <div className={cx('other')}>
                            <div className={cx('signup-gg')}>
                                <GgIcon />
                                <span className={cx('sg-text')}>Đăng kí với google</span>
                            </div>
                            <div className={cx('signup-fb')}>
                                <img src={require('~/assets/image/fb-icon.png')} alt="iconfb"></img>
                                <span className={cx('sg-text')}>Đăng kí với facebook</span>
                            </div>
                        </div>
                    </form>
                    <div className={cx('question')}>
                        <span>Bạn đã có tài khoản ?</span>
                        <Link to="/login" className={cx('had-account')}>
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
