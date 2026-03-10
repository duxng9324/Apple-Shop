import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from '~/layouts/DefaultLayout';
import DefaultLayoutAd from '~/layouts/DefaultLayoutAd';
import User from '~/pages/User';
import Admin from '~/pages/admin';
import { Login, SignUp } from '~/pages/auth';
import Cart from '~/pages/cart';
import Category from '~/pages/category';

import CategoryAd from '~/pages/categoryad';
import ColorAd from '~/pages/colorAd';
import Detail from '~/pages/detail';
import Home from '~/pages/home';
import MemoryAd from '~/pages/memoryad';
import Order from '~/pages/order';
import OrderAd from '~/pages/orderad';
import ProductAd from '~/pages/productad';

const router = createBrowserRouter([
    {
        path: '/admin/*',
        element: <DefaultLayoutAd />,
        children: [
            {
                path: 'category',
                element: <CategoryAd />,
                // loader: ProductAd,
            },
            {
                path: '',
                element: <Admin />,
                // loader: ProductAd,
            },
            { path: 'memory', element: <MemoryAd /> },
            { path: 'color', element: <ColorAd /> },
            { path: 'product', element: <ProductAd /> },
            { path: 'order', element: <OrderAd /> },
        ],
    },
    {
        path: '/login',
        element: <Login />,
        children: [],
    },
    {
        path: '/signup',
        element: <SignUp />,
        children: [],
    },
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/iphone',
                element: <Category title="iPhone" />,
            },
            {
                path: '/ipad',
                element: <Category title="iPad" />,
            },
            {
                path: '/mac',
                element: <Category title="MAC" />,
            },
            {
                path: '/watch',
                element: <Category title="Apple Watch" />,
            },
            {
                path: '/phu-kien',
                element: <Category title="Phụ kiện" />,
            },
            {
                path: '/:category/:productCode',
                element: <Detail />,
            },
            {
                path: '/cart',
                element: <Cart />,
            },
            {
                path: '/order',
                element: <Order />,
            },
            { path: '/user', element: <User /> },
        ],
    },
]);

export { router };
