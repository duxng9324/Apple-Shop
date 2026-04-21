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
    DeploymentUnitOutlined,
    AuditOutlined,
    TeamOutlined,
} from '@ant-design/icons';

import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

const { Header, Sider, Content } = Layout;

function DefaultLayoutAd() {
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState(0);
    const navigate = useNavigate();
    const siderWidth = 200;
    const collapsedSiderWidth = 80;
    const headerHeight = 64;

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        const decoded = jwt_decode(token);

        if (![1, 2, 3, 4].includes(Number(decoded.role))) {
            navigate('/');
            return;
        }

        setRole(Number(decoded.role));
    }, [navigate]);

    const canManageWarehouse = role === 1 || role === 2;
    const canManageProduct = role === 1 || role === 3;
    const canManageAccounting = role === 1 || role === 4;

    const menuItems = [
        canManageProduct
            ? {
                  key: '/admin/category',
                  icon: <AppstoreOutlined />,
                                    label: 'Danh mục',
              }
            : null,
        canManageProduct
            ? {
                  key: '/admin/color',
                  icon: <BgColorsOutlined />,
                                    label: 'Màu sắc',
              }
            : null,
        canManageProduct
            ? {
                  key: '/admin/memory',
                  icon: <DatabaseOutlined />,
                                    label: 'Bộ nhớ',
              }
            : null,
        canManageProduct
            ? {
                  key: '/admin/product',
                  icon: <ShoppingOutlined />,
                                    label: 'Sản phẩm',
              }
            : null,
        canManageWarehouse || canManageAccounting
            ? {
                  key: '/admin/order',
                  icon: <InboxOutlined />,
                                    label: 'Đơn hàng',
              }
            : null,
        canManageWarehouse
            ? {
                  key: '/admin/operations',
                  icon: <DeploymentUnitOutlined />,
                                    label: 'Kho và Lãi lỗ',
              }
            : null,
        canManageAccounting
            ? {
                  key: '/admin/accounting',
                  icon: <AuditOutlined />,
                                    label: 'Kế toán',
              }
            : null,
        role === 1
            ? {
                  key: '/admin/user-admin',
                  icon: <TeamOutlined />,
                                    label: 'Quản trị người dùng',
              }
            : null,
        {
            key: '/',
            icon: <UserOutlined />,
            label: 'Xem trang người dùng',
        },
    ].filter(Boolean);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Tài khoản',
                onClick: () => {navigate('/user')}
            },
            {
                key: 'logout',
                label: 'Đăng xuất',
                onClick: handleLogout,
            },
        ],
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={siderWidth}
                collapsedWidth={collapsedSiderWidth}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        textAlign: 'center',
                        padding: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                    }}
                >
                    QUẢN TRỊ
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    onClick={(item) => navigate(item.key)}
                    items={menuItems}
                />
            </Sider>

            <Layout
                style={{
                    marginLeft: collapsed ? collapsedSiderWidth : siderWidth,
                    transition: 'margin-left 0.2s',
                }}
            >
                <Header
                    style={{
                        padding: '0 20px',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'fixed',
                        top: 0,
                        left: collapsed ? collapsedSiderWidth : siderWidth,
                        right: 0,
                        height: headerHeight,
                        zIndex: 999,
                        transition: 'left 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                        marginTop: `calc(${headerHeight}px + 20px)`,
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
