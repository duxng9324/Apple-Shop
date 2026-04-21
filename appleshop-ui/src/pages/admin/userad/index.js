import { useEffect, useMemo, useState } from 'react';
import { Button, Card, message, Select, Space, Table, Tag, Typography } from 'antd';
import { UserAdminService } from '~/service/userAdminService';

const { Title, Text } = Typography;

const ROLE_MAP = {
    0: { label: 'Customer', color: 'blue' },
    1: { label: 'Admin', color: 'red' },
    2: { label: 'Warehouse Manager', color: 'volcano' },
    3: { label: 'Product Manager', color: 'orange' },
    4: { label: 'Accountant', color: 'green' },
};

function UserGroupPermissionAd() {
    const userAdminService = useMemo(() => new UserAdminService(), []);

    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [targetRole, setTargetRole] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userAdminService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBatchRoleUpdate = async () => {
        if (!selectedIds || selectedIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 người dùng');
            return;
        }

        if (targetRole === null || targetRole === undefined) {
            message.warning('Vui lòng chọn vai trò');
            return;
        }

        try {
            setLoading(true);
            const updates = selectedIds.map((userId) => ({
                userId,
                role: targetRole,
            }));

            await userAdminService.updateRoleBatch(updates);
            message.success('Cập nhật vai trò thành công');
            setSelectedIds([]);
            setTargetRole(null);
            fetchUsers();
        } catch (error) {
            const apiError = error?.response?.data;
            const errorMessage = typeof apiError === 'string' ? apiError : apiError?.message;
            message.error(errorMessage || 'Cập nhật vai trò thất bại');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Username', dataIndex: 'userName', width: 180 },
        { title: 'Tên đầy đủ', dataIndex: 'fullName' },
        {
            title: 'Vai trò hiện tại',
            dataIndex: 'role',
            width: 180,
            render: (role) => {
                const info = ROLE_MAP[role] || { label: 'Unknown', color: 'default' };
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        { title: 'Email', dataIndex: 'email' },
    ];

    const rowSelection = {
        selectedRowKeys: selectedIds,
        onChange: (keys) => setSelectedIds(keys),
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>Quản lý vai trò người dùng (Batch Update)</Title>
            <Text type="secondary">
                Chọn danh sách người dùng và vai trò mới để cập nhật hàng loạt. Tính năng này dành cho admin.
            </Text>

            <Card style={{ marginTop: 16, marginBottom: 16 }}>
                <Space wrap style={{ width: '100%' }}>
                    <Select
                        placeholder="Chọn vai trò mới"
                        value={targetRole}
                        onChange={setTargetRole}
                        style={{ width: 220 }}
                        options={[
                            { value: 0, label: 'Customer' },
                            { value: 2, label: 'Warehouse Manager' },
                            { value: 3, label: 'Product Manager' },
                            { value: 4, label: 'Accountant' },
                            { value: 1, label: 'Admin' },
                        ]}
                    />
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={handleBatchRoleUpdate}
                        disabled={selectedIds.length === 0}
                    >
                        Cập nhật {selectedIds.length} user thành vai trò đã chọn
                    </Button>
                </Space>
            </Card>

            <Card title={`Danh sách tất cả người dùng (${users.length})`}>
                <Table
                    rowKey={(record) => record.id ?? record.userName}
                    dataSource={users}
                    columns={columns}
                    rowSelection={rowSelection}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}

export default UserGroupPermissionAd;
