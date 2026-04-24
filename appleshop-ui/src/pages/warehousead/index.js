import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Statistic, Table, Tabs, Typography, message } from 'antd';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { WarehouseService } from '~/service/warehouseService';
import { InventoryService } from '~/service/inventoryService';
import { StockIssueService } from '~/service/stockIssueService';
import { StockReceiptService } from '~/service/stockReceiptService';
import { AccountingService } from '~/service/accountingService';
import { ProductService } from '~/service/productService';
import { MemoryService } from '~/service/memoryService';
import { CategoryService } from '~/service/categoryService';

const { Title, Text } = Typography;

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function monthRange(year, month) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    return { from: formatDate(from), to: formatDate(to) };
}

function quarterRange(year, quarter) {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const from = new Date(year, startMonth - 1, 1);
    const to = new Date(year, endMonth, 0);
    return { from: formatDate(from), to: formatDate(to) };
}

function WarehouseAd() {
    const navigate = useNavigate();
    const warehouseService = useMemo(() => new WarehouseService(), []);
    const inventoryService = useMemo(() => new InventoryService(), []);
    const stockIssueService = useMemo(() => new StockIssueService(), []);
    const stockReceiptService = useMemo(() => new StockReceiptService(), []);
    const accountingService = useMemo(() => new AccountingService(), []);
    const productService = useMemo(() => new ProductService(), []);
    const memoryService = useMemo(() => new MemoryService(), []);
    const categoryService = useMemo(() => new CategoryService(), []);

    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [memories, setMemories] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [stockIssues, setStockIssues] = useState([]);
    const [stockReceipts, setStockReceipts] = useState([]);
    const [report, setReport] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [quarter, setQuarter] = useState(1);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [quarterlyTrend, setQuarterlyTrend] = useState([]);

    const [warehouseForm] = Form.useForm();
    const [inventoryForm] = Form.useForm();
    const [receiptCreateForm] = Form.useForm();
    const [receiptBulkForm] = Form.useForm();
    const [issueForm] = Form.useForm();

    const getErrorMessage = (error, fallback) => {
        const apiError = error?.response?.data;
        if (typeof apiError === 'string') {
            return apiError;
        }
        if (apiError?.message) {
            return apiError.message;
        }
        return fallback;
    };

    const executeWithConflictRetry = async (action, maxRetry = 1) => {
        let attempt = 0;
        while (attempt <= maxRetry) {
            try {
                return await action();
            } catch (error) {
                const status = error?.response?.status;
                if (status === 409 && attempt < maxRetry) {
                    attempt += 1;
                    continue;
                }
                throw error;
            }
        }
    };

    const fetchData = async () => {
        try {
            const [warehouseRes, productRes, memoryRes, inventoryRes, issueRes, receiptRes] = await Promise.all([
                warehouseService.viewAll(),
                productService.view(),
                memoryService.view(),
                inventoryService.viewAll(),
                stockIssueService.viewAll(),
                stockReceiptService.viewAll(),
            ]);

            const categoryRes = await categoryService.view();
            setWarehouses(warehouseRes || []);
            setProducts(productRes || []);
            setCategories(categoryRes || []);
            setMemories(memoryRes || []);
            setInventories(inventoryRes || []);
            setStockIssues(issueRes || []);
            setStockReceipts(receiptRes || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu vận hành');
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if ((warehouses || []).length === 1) {
            receiptBulkForm.setFieldsValue({
                bulkWarehouseId: warehouses[0].id,
            });
        }
    }, [warehouses, receiptBulkForm]);

    const loadMonthReport = async () => {
        try {
            const range = monthRange(year, month);
            const data = await accountingService.getReport(range);
            setReport(data || null);
            await loadMonthlyTrend(year, month);
        } catch (error) {
            message.error('Không thể tải báo cáo tháng');
        }
    };

    const loadQuarterReport = async () => {
        try {
            const range = quarterRange(year, quarter);
            const data = await accountingService.getReport(range);
            setReport(data || null);
            await loadQuarterlyTrend(year, quarter);
        } catch (error) {
            message.error('Không thể tải báo cáo quý');
        }
    };

    const loadMonthlyTrend = async (baseYear, baseMonth) => {
        const tasks = [];
        for (let i = 5; i >= 0; i -= 1) {
            const point = new Date(baseYear, baseMonth - 1 - i, 1);
            const y = point.getFullYear();
            const m = point.getMonth() + 1;
            const range = monthRange(y, m);
            tasks.push(accountingService.getReport(range).then((res) => ({ y, m, res })));
        }

        const results = await Promise.all(tasks);
        const mapped = results.map((item) => ({
            period: `${item.m}/${item.y}`,
            revenue: Number(item.res?.revenue || 0),
            profit: Number(item.res?.grossProfit || 0),
            cogs: Number(item.res?.costOfGoodsSold || 0),
        }));
        setMonthlyTrend(mapped);
    };

    const loadQuarterlyTrend = async (baseYear, baseQuarter) => {
        const tasks = [];
        for (let i = 3; i >= 0; i -= 1) {
            const rawQuarter = baseQuarter - i;
            const shiftYear = rawQuarter <= 0 ? Math.ceil(Math.abs(rawQuarter) / 4) : 0;
            const y = baseYear - shiftYear;
            const normalizedQuarter = ((rawQuarter - 1 + 12) % 4) + 1;
            const range = quarterRange(y, normalizedQuarter);
            tasks.push(accountingService.getReport(range).then((res) => ({ y, q: normalizedQuarter, res })));
        }

        const results = await Promise.all(tasks);
        const mapped = results.map((item) => ({
            period: `Q${item.q}/${item.y}`,
            revenue: Number(item.res?.revenue || 0),
            profit: Number(item.res?.grossProfit || 0),
            cogs: Number(item.res?.costOfGoodsSold || 0),
        }));
        setQuarterlyTrend(mapped);
    };

    const onCreateWarehouse = async (values) => {
        try {
            await warehouseService.add(values);
            message.success('Tạo kho thành công');
            warehouseForm.resetFields();
            fetchData();
        } catch {
            message.error('Tạo kho thất bại');
        }
    };

    const onAdjustInventory = async (values) => {
        try {
            await executeWithConflictRetry(() => inventoryService.adjust(values), 1);
            message.success('Điều chỉnh tồn kho thành công');
            inventoryForm.resetFields();
            fetchData();
        } catch (error) {
            message.error(getErrorMessage(error, 'Điều chỉnh tồn kho thất bại'));
        }
    };

    const onCreateReceipt = async (values) => {
        try {
            const receiptMode = values.receiptMode || 'existing';
            const item = {
                memoryType: values.memoryType,
                quantity: values.quantity,
                unitCost: values.unitCost,
            };

            if (receiptMode === 'new') {
                item.productCode = values.productCode;
                item.productName = values.productName;
                item.categoryCode = values.categoryCode;
            } else {
                item.productId = values.productId;
            }

            const payload = {
                warehouseId: values.warehouseId,
                supplier: values.supplier,
                note: values.note,
                items: [item],
            };
            await executeWithConflictRetry(() => stockReceiptService.create(payload), 1);
            message.success('Lập phiếu nhập kho thành công');
            receiptCreateForm.resetFields();
            receiptCreateForm.setFieldsValue({ receiptMode: 'existing' });
            fetchData();
        } catch (error) {
            message.error(getErrorMessage(error, 'Lập phiếu nhập kho thất bại'));
        }
    };

    const onCreateIssue = async (values) => {
        try {
            const payload = {
                warehouseId: values.warehouseId,
                note: values.note,
                items: [
                    {
                        productId: values.productId,
                        memoryType: values.memoryType,
                        quantity: values.quantity,
                        unitCost: values.unitCost,
                    },
                ],
            };
            await executeWithConflictRetry(() => stockIssueService.create(payload), 1);
            message.success('Lập phiếu xuất kho thành công');
            issueForm.resetFields();
            fetchData();
        } catch (error) {
            message.error(getErrorMessage(error, 'Lập phiếu xuất kho thất bại'));
        }
    };

    const onBulkCreateReceipt = async (values) => {
        try {
            const warehouseId = values.bulkWarehouseId;
            const quantity = Number(values.bulkQuantity || 0);
            const unitCost = Number(values.bulkUnitCost || 0);

            if (!warehouseId) {
                message.error('Vui lòng chọn kho để nhập nhanh');
                return;
            }

            if (!Number.isFinite(quantity) || quantity <= 0) {
                message.error('Số lượng nhập nhanh phải lớn hơn 0');
                return;
            }

            const items = [];
            for (const product of products || []) {
                const memorySet = new Set();
                const memoryList = Array.isArray(product?.list) && product.list.length > 0
                    ? product.list
                    : [{ type: 'DEFAULT' }];

                for (const memoryItem of memoryList) {
                    const memoryType = (memoryItem?.type || 'DEFAULT').toString().trim().toUpperCase();
                    if (!memoryType || memorySet.has(memoryType)) {
                        continue;
                    }

                    memorySet.add(memoryType);
                    items.push({
                        productId: product.id,
                        memoryType,
                        quantity,
                        unitCost,
                    });
                }
            }

            if (items.length === 0) {
                message.warning('Không có sản phẩm nào để nhập tự động');
                return;
            }

            const payload = {
                warehouseId,
                supplier: values.bulkSupplier,
                note: values.bulkNote || `Nhập tự động toàn bộ sản phẩm (${items.length} dòng)`,
                items,
            };

            await executeWithConflictRetry(() => stockReceiptService.create(payload), 1);
            message.success(`Đã nhập tự động ${items.length} dòng tồn kho`);
            receiptBulkForm.setFieldsValue({
                bulkNote: undefined,
            });
            fetchData();
        } catch (error) {
            message.error(getErrorMessage(error, 'Nhập tự động thất bại'));
        }
    };

    const warehouseOptions = warehouses.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
    }));

    const productOptions = products.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
    }));

    const categoryOptions = categories.map((item) => ({
        value: item.code,
        label: `${item.code} - ${item.name}`,
    }));

    const backendMemoryOptions = useMemo(() => {
        const normalized = new Set(
            (memories || [])
                .map((item) => (item?.type || '').toString().trim().toUpperCase())
                .filter(Boolean),
        );

        return Array.from(normalized).map((memory) => ({
            value: memory,
            label: memory,
        }));
    }, [memories]);

    const handleProductChange = (form) => () => {
        form.setFieldsValue({
            memoryType: undefined,
        });
    };

    const inventoryColumns = [
        { title: 'Kho', dataIndex: 'warehouseName' },
        { title: 'Sản phẩm', dataIndex: 'productName' },
        { title: 'Bộ nhớ', dataIndex: 'memoryType' },
        { title: 'Số lượng', dataIndex: 'quantity' },
        {
            title: 'Giá vốn',
            render: (_, record) => Number(record.unitCost || 0).toLocaleString('vi-VN') + 'đ',
        },
        {
            title: 'Giá trị tồn',
            render: (_, record) => Number(record.stockValue || 0).toLocaleString('vi-VN') + 'đ',
        },
    ];

    const receiptColumns = [
        { title: 'Mã phiếu', dataIndex: 'code' },
        { title: 'Kho', dataIndex: 'warehouseName' },
        { title: 'Ngày nhập', render: (_, r) => formatDate(r.receiptDate) },
        { title: 'Nhà cung cấp', dataIndex: 'supplier' },
        { title: 'Tổng giá vốn', render: (_, r) => Number(r.totalCost || 0).toLocaleString('vi-VN') + 'đ' },
    ];

    const issueColumns = [
        { title: 'Mã phiếu', dataIndex: 'code' },
        { title: 'Kho', dataIndex: 'warehouseName' },
        { title: 'Ngày xuất', render: (_, r) => formatDate(r.issueDate) },
        { title: 'Ghi chú', dataIndex: 'note' },
        { title: 'Tổng giá vốn', render: (_, r) => Number(r.totalCost || 0).toLocaleString('vi-VN') + 'đ' },
    ];

    return (
        <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
                <Title level={3} style={{ marginBottom: 0 }}>Vận hành kho & kế toán</Title>
                <Button onClick={() => navigate('/admin/accounting')}>
                    Mở Accounting Center
                </Button>
            </Space>

            <Tabs
                items={[
                    {
                        key: 'warehouse',
                        label: 'Kho & Tồn kho',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} lg={10}>
                                    <Card title="Tạo kho mới">
                                        <Form layout="vertical" form={warehouseForm} onFinish={onCreateWarehouse}>
                                            <Form.Item name="code" label="Mã kho" rules={[{ required: true }]}>
                                                <Input placeholder="WH-HCM-01" />
                                            </Form.Item>
                                            <Form.Item name="name" label="Tên kho" rules={[{ required: true }]}>
                                                <Input placeholder="Kho HCM" />
                                            </Form.Item>
                                            <Form.Item name="address" label="Địa chỉ">
                                                <Input placeholder="Địa chỉ kho" />
                                            </Form.Item>
                                            <Button type="primary" htmlType="submit">Tạo kho</Button>
                                        </Form>
                                    </Card>
                                </Col>
                                <Col xs={24} lg={14}>
                                    <Card title="Danh sách kho">
                                        <Table
                                            rowKey="id"
                                            dataSource={warehouses}
                                            pagination={false}
                                            columns={[
                                                { title: 'Mã kho', dataIndex: 'code' },
                                                { title: 'Tên kho', dataIndex: 'name' },
                                                { title: 'Địa chỉ', dataIndex: 'address' },
                                                { title: 'Kích hoạt', render: (_, r) => (r.active ? 'Có' : 'Không') },
                                            ]}
                                        />
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card title="Điều chỉnh tồn kho (chỉ giảm)">
                                        <Form layout="vertical" form={inventoryForm} onFinish={onAdjustInventory}>
                                            <Text type="secondary">Nhập hàng bắt buộc qua tab Phiếu nhập. Khu vực này chỉ dùng để giảm số lượng tồn.</Text>
                                            <Row gutter={[12, 0]}>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}>
                                                        <Select options={warehouseOptions} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true }]}>
                                                        <Select
                                                            options={productOptions}
                                                            onChange={handleProductChange(inventoryForm)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="memoryType" label="Bộ nhớ" rules={[{ required: true }]}>
                                                        <Select
                                                            placeholder="Chọn bộ nhớ"
                                                            options={backendMemoryOptions}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item
                                                        name="quantityDelta"
                                                        label="Số lượng điều chỉnh (-)"
                                                        rules={[
                                                            { required: true },
                                                            {
                                                                validator: (_, value) => {
                                                                    if (typeof value === 'number' && value < 0) {
                                                                        return Promise.resolve();
                                                                    }
                                                                    return Promise.reject(new Error('Chỉ nhận số âm để giảm tồn kho'));
                                                                },
                                                            },
                                                        ]}
                                                        extra="Giá trị phải nhỏ hơn 0, ví dụ: -1, -5"
                                                    >
                                                        <InputNumber style={{ width: '100%' }} max={-1} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="unitCost" label="Giá vốn">
                                                        <InputNumber style={{ width: '100%' }} min={0} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'end' }}>
                                                    <Button type="primary" htmlType="submit">Cập nhật tồn</Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card title="Bảng tồn kho">
                                        <Table rowKey="id" dataSource={inventories} columns={inventoryColumns} />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'receipt',
                        label: 'Phiếu nhập',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card title="Lập phiếu nhập kho">
                                        <Form
                                            layout="vertical"
                                            form={receiptCreateForm}
                                            onFinish={onCreateReceipt}
                                            initialValues={{ receiptMode: 'existing' }}
                                        >
                                            <Row gutter={[12, 0]}>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="receiptMode" label="Loại nhập" rules={[{ required: true }]}>
                                                        <Select
                                                            options={[
                                                                { value: 'existing', label: 'Sản phẩm cũ' },
                                                                { value: 'new', label: 'Sản phẩm mới' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}><Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}><Select options={warehouseOptions} /></Form.Item></Col>
                                                <Form.Item noStyle shouldUpdate>
                                                    {({ getFieldValue }) =>
                                                        getFieldValue('receiptMode') === 'new' ? (
                                                            <>
                                                                <Col xs={24} md={8}><Form.Item name="productCode" label="Mã sản phẩm mới" rules={[{ required: true }]}><Input placeholder="Ví dụ: IP16PM" /></Form.Item></Col>
                                                                <Col xs={24} md={8}><Form.Item name="productName" label="Tên sản phẩm mới" rules={[{ required: true }]}><Input placeholder="Ví dụ: iPhone 16 Pro Max" /></Form.Item></Col>
                                                                <Col xs={24} md={8}><Form.Item name="categoryCode" label="Danh mục" rules={[{ required: true }]}><Select options={categoryOptions} placeholder="Chọn danh mục" /></Form.Item></Col>
                                                            </>
                                                        ) : (
                                                            <Col xs={24} md={8}><Form.Item name="productId" label="Sản phẩm" rules={[{ required: true }]}><Select options={productOptions} onChange={handleProductChange(receiptCreateForm)} /></Form.Item></Col>
                                                        )
                                                    }
                                                </Form.Item>
                                                <Col xs={24} md={8}><Form.Item name="memoryType" label="Bộ nhớ" rules={[{ required: true }]}><Select placeholder="Chọn bộ nhớ" options={backendMemoryOptions} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="unitCost" label="Giá vốn" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="supplier" label="Nhà cung cấp"><Input /></Form.Item></Col>
                                                <Col span={24}><Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item></Col>
                                                <Col span={24}><Button type="primary" htmlType="submit">Tạo phiếu nhập</Button></Col>
                                            </Row>
                                        </Form>
                                    </Card>
                                </Col>
                                <Col span={24}>
                                    <Card title="Nhập nhanh toàn bộ sản phẩm hiện có">
                                        <Form
                                            layout="vertical"
                                            form={receiptBulkForm}
                                            onFinish={onBulkCreateReceipt}
                                            initialValues={{
                                                bulkQuantity: 5,
                                                bulkUnitCost: 0,
                                            }}
                                        >
                                            <Row gutter={[12, 0]}>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="bulkWarehouseId" label="Kho" rules={[{ required: true }]}>
                                                        <Select options={warehouseOptions} placeholder="Chọn kho" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="bulkQuantity" label="Số lượng mỗi bộ nhớ" rules={[{ required: true }]}>
                                                        <InputNumber min={1} style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="bulkUnitCost" label="Giá vốn mỗi bộ nhớ" rules={[{ required: true }]}>
                                                        <InputNumber min={0} style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item name="bulkSupplier" label="Nhà cung cấp">
                                                        <Input placeholder="Nhập nhà cung cấp (tùy chọn)" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={16}>
                                                    <Form.Item name="bulkNote" label="Ghi chú">
                                                        <Input placeholder="Ví dụ: nhập tự động đợt đầu" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={24}>
                                                    <Button type="primary" htmlType="submit">
                                                        Nhập tất cả sản phẩm vào kho
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card>
                                </Col>
                                <Col span={24}><Card title="Danh sách phiếu nhập"><Table rowKey="id" dataSource={stockReceipts} columns={receiptColumns} /></Card></Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'issue',
                        label: 'Phiếu xuất',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card title="Lập phiếu xuất kho">
                                        <Form layout="vertical" form={issueForm} onFinish={onCreateIssue}>
                                            <Row gutter={[12, 0]}>
                                                <Col xs={24} md={8}><Form.Item name="warehouseId" label="Kho" rules={[{ required: true }]}><Select options={warehouseOptions} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="productId" label="Sản phẩm" rules={[{ required: true }]}><Select options={productOptions} onChange={handleProductChange(issueForm)} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="memoryType" label="Bộ nhớ" rules={[{ required: true }]}><Select placeholder="Chọn bộ nhớ" options={backendMemoryOptions} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col xs={24} md={8}><Form.Item name="unitCost" label="Giá vốn"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col span={24}><Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item></Col>
                                                <Col span={24}><Button type="primary" htmlType="submit">Tạo phiếu xuất</Button></Col>
                                            </Row>
                                        </Form>
                                    </Card>
                                </Col>
                                <Col span={24}><Card title="Danh sách phiếu xuất"><Table rowKey="id" dataSource={stockIssues} columns={issueColumns} /></Card></Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'report',
                        label: 'Dashboard lợi nhuận',
                        children: (
                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                <Card title="Báo cáo theo tháng">
                                    <Space wrap>
                                        <InputNumber value={month} min={1} max={12} onChange={(v) => setMonth(v || 1)} addonBefore="Tháng" />
                                        <InputNumber value={year} min={2020} max={2100} onChange={(v) => setYear(v || new Date().getFullYear())} addonBefore="Năm" />
                                        <Button type="primary" onClick={loadMonthReport}>Xem báo cáo tháng</Button>
                                    </Space>
                                </Card>

                                <Card title="Báo cáo theo quý">
                                    <Space wrap>
                                        <Select value={quarter} onChange={setQuarter} options={[1, 2, 3, 4].map((q) => ({ value: q, label: `Quý ${q}` }))} style={{ width: 120 }} />
                                        <InputNumber value={year} min={2020} max={2100} onChange={(v) => setYear(v || new Date().getFullYear())} addonBefore="Năm" />
                                        <Button type="primary" onClick={loadQuarterReport}>Xem báo cáo quý</Button>
                                    </Space>
                                </Card>

                                {report && (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={8}><Card><Statistic title="Doanh thu" value={Number(report.revenue || 0)} precision={0} formatter={(v) => Number(v).toLocaleString('vi-VN') + 'đ'} /></Card></Col>
                                        <Col xs={24} md={8}><Card><Statistic title="Giá vốn (COGS)" value={Number(report.costOfGoodsSold || 0)} precision={0} formatter={(v) => Number(v).toLocaleString('vi-VN') + 'đ'} /></Card></Col>
                                        <Col xs={24} md={8}><Card><Statistic title="Lợi nhuận gộp" value={Number(report.grossProfit || 0)} precision={0} formatter={(v) => Number(v).toLocaleString('vi-VN') + 'đ'} /></Card></Col>
                                        <Col xs={24} md={8}><Card><Statistic title="Biên lợi nhuận" value={Number(report.grossMarginPercent || 0)} suffix="%" precision={2} /></Card></Col>
                                        <Col xs={24} md={8}><Card><Statistic title="Số đơn hàng" value={Number(report.totalOrders || 0)} /></Card></Col>
                                        <Col xs={24} md={8}><Card><Statistic title="Số phiếu xuất" value={Number(report.totalStockIssueVouchers || 0)} /></Card></Col>
                                    </Row>
                                )}

                                {monthlyTrend.length > 0 && (
                                    <Card title="Biểu đồ xu hướng 6 tháng gần nhất">
                                        <div style={{ width: '100%', height: 340 }}>
                                            <ResponsiveContainer>
                                                <LineChart data={monthlyTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="period" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + 'đ'} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="revenue" stroke="#1677ff" name="Doanh thu" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="cogs" stroke="#fa8c16" name="Giá vốn" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="profit" stroke="#52c41a" name="Lợi nhuận" strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                )}

                                {quarterlyTrend.length > 0 && (
                                    <Card title="Biểu đồ quý (Revenue vs Profit)">
                                        <div style={{ width: '100%', height: 340 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={quarterlyTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="period" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + 'đ'} />
                                                    <Legend />
                                                    <Bar dataKey="revenue" fill="#1677ff" name="Doanh thu" />
                                                    <Bar dataKey="profit" fill="#52c41a" name="Lợi nhuận" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                )}

                                {!report && <Text type="secondary">Chọn tháng/quý để xem dashboard lợi nhuận.</Text>}
                            </Space>
                        ),
                    },
                ]}
            />
        </div>
    );
}

export default WarehouseAd;
