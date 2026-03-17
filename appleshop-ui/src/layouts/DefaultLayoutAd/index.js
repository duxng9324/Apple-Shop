import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    BgColorsOutlined,
    DatabaseOutlined,
    ShoppingOutlined,
    UserOutlined,
    InboxOutlined,
    LogoutOutlined,
} from '@ant-design/icons';

import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const { Header, Sider, Content } = Layout;

function DefaultLayoutAd() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        const decoded = jwt_decode(token);

        if (decoded.role !== 1) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                onClick: () => {navigate('/user')}
            },
            {
                key: 'logout',
                label: 'Logout',
                onClick: handleLogout,
            },
        ],
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        color: 'white',
                        textAlign: 'center',
                        padding: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                    }}
                >
                    WEB ADMIN
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    onClick={(item) => navigate(item.key)}
                    items={[
                        {
                            key: '/admin/category',
                            icon: <AppstoreOutlined />,
                            label: 'Category',
                        },
                        {
                            key: '/admin/color',
                            icon: <BgColorsOutlined />,
                            label: 'Color',
                        },
                        {
                            key: '/admin/memory',
                            icon: <DatabaseOutlined />,
                            label: 'Memory',
                        },
                        {
                            key: '/admin/product',
                            icon: <ShoppingOutlined />,
                            label: 'Product',
                        },
                        {
                            key: '/admin/order',
                            icon: <InboxOutlined />,
                            label: 'Order',
                        },
                        {
                            key: '/',
                            icon: <UserOutlined />,
                            label: 'View Web Client',
                        },
                    ]}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 20px',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>

                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Avatar size={40} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: '20px',
                        padding: '24px',
                        background: '#fff',
                        borderRadius: '10px',
                        minHeight: '280px',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default DefaultLayoutAd;
