import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { AccountingService } from '~/service/accountingService';

const { Title, Text } = Typography;
const CHART_COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#13c2c2', '#722ed1', '#eb2f96', '#2f54eb'];

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function formatDate(value) {
    if (!value) {
        return '';
    }

    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) {
        return '';
    }

    const y = dt.getFullYear();
    const m = `${dt.getMonth() + 1}`.padStart(2, '0');
    const d = `${dt.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function AccountingAd() {
    const accountingService = useMemo(() => new AccountingService(), []);

    const [report, setReport] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [coaRows, setCoaRows] = useState([]);
    const [journalRows, setJournalRows] = useState([]);
    const [arRows, setArRows] = useState([]);
    const [apRows, setApRows] = useState([]);
    const [cashReceiptRows, setCashReceiptRows] = useState([]);
    const [cashPaymentRows, setCashPaymentRows] = useState([]);
    const [reconciliation, setReconciliation] = useState(null);

    const [reportFrom, setReportFrom] = useState(dayjs().startOf('month'));
    const [reportTo, setReportTo] = useState(dayjs().endOf('month'));
    const [journalFrom, setJournalFrom] = useState(dayjs().startOf('month'));
    const [journalTo, setJournalTo] = useState(dayjs().endOf('month'));
    const [agingDate, setAgingDate] = useState(dayjs());

    const [loading, setLoading] = useState(false);

    const getErrorMessage = useCallback((error, fallback) => {
        const apiError = error?.response?.data;
        if (typeof apiError === 'string') {
            return apiError;
        }
        if (apiError?.message) {
            return apiError.message;
        }
        return fallback;
    }, []);

    const loadData = useCallback(async () => {
        if (reportFrom.isAfter(reportTo)) {
            message.warning('Khoảng ngày báo cáo không hợp lệ');
            return;
        }

        if (journalFrom.isAfter(journalTo)) {
            message.warning('Khoảng ngày nhật ký không hợp lệ');
            return;
        }

        const reportFromValue = reportFrom.format('YYYY-MM-DD');
        const reportToValue = reportTo.format('YYYY-MM-DD');
        const from = journalFrom.format('YYYY-MM-DD');
        const to = journalTo.format('YYYY-MM-DD');
        const asOf = agingDate.format('YYYY-MM-DD');

        try {
            setLoading(true);
            const [summary, coa, journal, ar, ap, reco, receipts, payments, dashboardData] = await Promise.all([
                accountingService.getReport({ from: reportFromValue, to: reportToValue }),
                accountingService.getChartOfAccounts(),
                accountingService.getJournal({ from, to }),
                accountingService.getReceivableAging({ asOf }),
                accountingService.getPayableAging({ asOf }),
                accountingService.getReconciliationSummary(),
                accountingService.getCashReceipts({ from: reportFromValue, to: reportToValue }),
                accountingService.getCashPayments({ from: reportFromValue, to: reportToValue }),
                accountingService.getDashboard({ from: reportFromValue, to: reportToValue }),
            ]);

            setReport(summary || null);
            setCoaRows(coa || []);
            setJournalRows(journal || []);
            setArRows(ar || []);
            setApRows(ap || []);
            setReconciliation(reco || null);
            setCashReceiptRows(receipts || []);
            setCashPaymentRows(payments || []);
            setDashboard(dashboardData || null);
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể tải dữ liệu kế toán'));
        } finally {
            setLoading(false);
        }
    }, [accountingService, agingDate, getErrorMessage, journalFrom, journalTo, reportFrom, reportTo]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalAR = arRows.reduce((acc, item) => acc + Number(item.outstandingAmount || 0), 0);
    const totalAP = apRows.reduce((acc, item) => acc + Number(item.outstandingAmount || 0), 0);
    const totalCashReceipts = cashReceiptRows.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const totalCashPayments = cashPaymentRows.reduce((acc, item) => acc + Number(item.amount || 0), 0);

    const downloadExcel = (fileName, sheets) => {
        const workbook = XLSX.utils.book_new();

        sheets.forEach((sheet) => {
            const data = sheet?.data || [];
            const worksheet = data.length > 0 ? XLSX.utils.json_to_sheet(data) : XLSX.utils.json_to_sheet([{ note: 'Không có dữ liệu' }]);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        });

        XLSX.writeFile(workbook, `${fileName}-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`);
    };

    const exportCashReceiptExcel = () => {
        downloadExcel('phieu-thu', [
            {
                name: 'PhieuThu',
                data: cashReceiptRows.map((item, index) => ({
                    STT: index + 1,
                    SoPhieu: item.voucherCode,
                    Ngay: formatDate(item.voucherDate),
                    DoiTuong: item.counterparty || '',
                    PhuongThuc: item.method || '',
                    SoTien: Number(item.amount || 0),
                    TrangThai: item.status || '',
                    DienGiai: item.description || '',
                    ThamChieu: item.referenceNo || '',
                })),
            },
        ]);
    };

    const exportCashPaymentExcel = () => {
        downloadExcel('phieu-chi', [
            {
                name: 'PhieuChi',
                data: cashPaymentRows.map((item, index) => ({
                    STT: index + 1,
                    SoPhieu: item.voucherCode,
                    Ngay: formatDate(item.voucherDate),
                    DoiTuong: item.counterparty || '',
                    PhuongThuc: item.method || '',
                    SoTien: Number(item.amount || 0),
                    TrangThai: item.status || '',
                    DienGiai: item.description || '',
                    ThamChieu: item.referenceNo || '',
                })),
            },
        ]);
    };

    const exportFullAccountingReport = () => {
        downloadExcel('bao-cao-ke-toan', [
            {
                name: 'TongHop',
                data: [
                    {
                        TuNgay: formatDate(report?.fromDate),
                        DenNgay: formatDate(report?.toDate),
                        DoanhThu: Number(report?.revenue || 0),
                        GiaVon: Number(report?.costOfGoodsSold || 0),
                        LaiGop: Number(report?.grossProfit || 0),
                        BienLaiGop: Number(report?.grossMarginPercent || 0),
                        TongChiPhi: Number(dashboard?.expense || 0),
                        LoiNhuanRong: Number(dashboard?.profit || 0),
                        DongTienThuan: Number(dashboard?.netCashInflow || 0),
                        TongPhieuThu: Number(totalCashReceipts || 0),
                        TongPhieuChi: Number(totalCashPayments || 0),
                        SoDonHang: Number(report?.totalOrders || 0),
                    },
                ],
            },
            {
                name: 'TrendTheoThang',
                data: (dashboard?.monthlyTrend || []).map((item) => ({
                    Ky: item.period,
                    DoanhThu: Number(item.revenue || 0),
                    GiaVon: Number(item.costOfGoodsSold || 0),
                    ChiPhi: Number(item.expense || 0),
                    LoiNhuan: Number(item.profit || 0),
                })),
            },
            {
                name: 'TyLeSanPham',
                data: (dashboard?.productSaleRatios || []).map((item) => ({
                    SanPham: item.productName,
                    SoLuongBan: Number(item.quantitySold || 0),
                    TyLe: Number(item.ratioPercent || 0),
                })),
            },
            {
                name: 'CongNoPhaiThu',
                data: arRows.map((item) => ({
                    ChungTu: item.documentCode,
                    KhachHang: item.customerName,
                    DenHan: formatDate(item.dueDate),
                    QuaHanNgay: Number(item.overdueDays || 0),
                    DuNo: Number(item.outstandingAmount || 0),
                    TrangThai: item.status,
                })),
            },
            {
                name: 'CongNoPhaiTra',
                data: apRows.map((item) => ({
                    ChungTu: item.documentCode,
                    NhaCungCap: item.supplierName,
                    DenHan: formatDate(item.dueDate),
                    QuaHanNgay: Number(item.overdueDays || 0),
                    DuPhaiTra: Number(item.outstandingAmount || 0),
                    TrangThai: item.status,
                })),
            },
        ]);
    };

    const coaColumns = [
        { title: 'Mã TK', dataIndex: 'accountCode', width: 120 },
        { title: 'Tên tài khoản', dataIndex: 'accountName' },
        { title: 'Loại', dataIndex: 'accountType', width: 140 },
        { title: 'Số dư chuẩn', dataIndex: 'normalBalance', width: 140 },
        {
            title: 'Trạng thái',
            width: 120,
            render: (_, row) => (row.active ? <Tag color="green">HOẠT_ĐỘNG</Tag> : <Tag color="default">NGỪNG_HOẠT_ĐỘNG</Tag>),
        },
    ];

    const journalColumns = [
        { title: 'Số CT', dataIndex: 'entryNumber', width: 220 },
        { title: 'Ngày', render: (_, row) => formatDate(row.entryDate), width: 120 },
        { title: 'Loại', dataIndex: 'entryType', width: 140 },
        { title: 'Nguồn', dataIndex: 'sourceType', width: 120 },
        { title: 'Mã nguồn', dataIndex: 'sourceCode', width: 180 },
        { title: 'Diễn giải', dataIndex: 'description' },
        { title: 'Nợ', width: 140, render: (_, row) => formatMoney(row.totalDebit) },
        { title: 'Có', width: 140, render: (_, row) => formatMoney(row.totalCredit) },
        {
            title: 'Ghi sổ',
            width: 120,
            render: (_, row) =>
                row.postingStatus === 'POSTED' ? <Tag color="green">ĐÃ_GHI_SỔ</Tag> : <Tag color="orange">NHÁP</Tag>,
        },
    ];

    const arColumns = [
        { title: 'Chứng từ', dataIndex: 'documentCode', width: 180 },
        { title: 'Khách hàng', dataIndex: 'customerName' },
        { title: 'Đến hạn', width: 120, render: (_, row) => formatDate(row.dueDate) },
        { title: 'Quá hạn (ngày)', dataIndex: 'overdueDays', width: 140 },
        { title: 'Dư nợ', width: 140, render: (_, row) => formatMoney(row.outstandingAmount) },
        {
            title: 'Trạng thái',
            width: 120,
            render: (_, row) => (row.status === 'OPEN' ? <Tag color="red">MỞ</Tag> : <Tag color="green">ĐÓNG</Tag>),
        },
    ];

    const apColumns = [
        { title: 'Chứng từ', dataIndex: 'documentCode', width: 180 },
        { title: 'Nhà cung cấp', dataIndex: 'supplierName' },
        { title: 'Đến hạn', width: 120, render: (_, row) => formatDate(row.dueDate) },
        { title: 'Quá hạn (ngày)', dataIndex: 'overdueDays', width: 140 },
        { title: 'Dư phải trả', width: 160, render: (_, row) => formatMoney(row.outstandingAmount) },
        {
            title: 'Trạng thái',
            width: 120,
            render: (_, row) => (row.status === 'OPEN' ? <Tag color="volcano">MỞ</Tag> : <Tag color="green">ĐÓNG</Tag>),
        },
    ];

    const cashVoucherColumns = [
        { title: 'Số phiếu', dataIndex: 'voucherCode', width: 180 },
        { title: 'Ngày', render: (_, row) => formatDate(row.voucherDate), width: 120 },
        { title: 'Đối tượng', dataIndex: 'counterparty' },
        { title: 'Phương thức', dataIndex: 'method', width: 140 },
        { title: 'Diễn giải', dataIndex: 'description' },
        { title: 'Tham chiếu', dataIndex: 'referenceNo', width: 160 },
        { title: 'Số tiền', width: 160, render: (_, row) => formatMoney(row.amount) },
        { title: 'Trạng thái', dataIndex: 'status', width: 140 },
    ];

    const productRatioChartData = (dashboard?.productSaleRatios || []).map((item) => ({
        name: item.productName,
        value: Number(item.quantitySold || 0),
        ratio: Number(item.ratioPercent || 0),
    }));

    const expenseCategoryData = (dashboard?.expenseByCategory || []).map((item) => ({
        category: item.expenseCategory,
        amount: Number(item.amount || 0),
    }));

    const paymentMethodData = (dashboard?.paymentMethodBreakdown || []).map((item) => ({
        method: item.paymentMethod,
        amount: Number(item.amount || 0),
    }));

    const monthlyTrendData = (dashboard?.monthlyTrend || []).map((item) => ({
        period: item.period,
        revenue: Number(item.revenue || 0),
        expense: Number(item.expense || 0),
        cogs: Number(item.costOfGoodsSold || 0),
        profit: Number(item.profit || 0),
    }));

    return (
        <div>
            <Title level={3}>Trung tâm kế toán</Title>
            <Text type="secondary">
                Khu vực kế toán tổng hợp: dashboard lợi nhuận, phiếu thu/chi, công nợ, nhật ký và đối soát.
            </Text>

            <Card style={{ marginTop: 16 }}>
                <Space wrap>
                    <Text strong>Báo cáo tổng hợp:</Text>
                    <DatePicker value={reportFrom} onChange={(v) => setReportFrom(v || dayjs().startOf('month'))} />
                    <DatePicker value={reportTo} onChange={(v) => setReportTo(v || dayjs().endOf('month'))} />
                    <Text strong>Nhật ký:</Text>
                    <DatePicker value={journalFrom} onChange={(v) => setJournalFrom(v || dayjs().startOf('month'))} />
                    <DatePicker value={journalTo} onChange={(v) => setJournalTo(v || dayjs().endOf('month'))} />
                    <Text strong>Aging:</Text>
                    <DatePicker value={agingDate} onChange={(v) => setAgingDate(v || dayjs())} />
                    <Button type="primary" onClick={loadData} loading={loading}>
                        Tải dữ liệu
                    </Button>
                    <Button onClick={exportCashReceiptExcel}>Xuất Excel Phiếu Thu</Button>
                    <Button onClick={exportCashPaymentExcel}>Xuất Excel Phiếu Chi</Button>
                    <Button type="dashed" onClick={exportFullAccountingReport}>Xuất báo cáo tổng hợp</Button>
                </Space>
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Doanh thu" value={Number(report?.revenue || 0)} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Giá vốn" value={Number(report?.costOfGoodsSold || 0)} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Lãi gộp"
                            value={Number(report?.grossProfit || 0)}
                            precision={0}
                            valueStyle={{ color: Number(report?.grossProfit || 0) >= 0 ? '#3f8600' : '#cf1322' }}
                            formatter={(v) => formatMoney(v)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Biên lợi nhuận gộp" value={Number(report?.grossMarginPercent || 0)} suffix="%" precision={2} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Số đơn hàng" value={Number(report?.totalOrders || 0)} precision={0} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Số phiếu xuất" value={Number(report?.totalStockIssueVouchers || 0)} precision={0} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Tổng phải thu (AR)" value={totalAR} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Tổng phải trả (AP)" value={totalAP} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Tổng phiếu thu" value={totalCashReceipts} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Tổng phiếu chi" value={totalCashPayments} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Lợi nhuận ròng"
                            value={Number(dashboard?.profit || 0)}
                            precision={0}
                            valueStyle={{ color: Number(dashboard?.profit || 0) >= 0 ? '#3f8600' : '#cf1322' }}
                            formatter={(v) => formatMoney(v)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Dòng tiền thuần"
                            value={Number(dashboard?.netCashInflow || 0)}
                            precision={0}
                            valueStyle={{ color: Number(dashboard?.netCashInflow || 0) >= 0 ? '#3f8600' : '#cf1322' }}
                            formatter={(v) => formatMoney(v)}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Giá trị đơn TB" value={Number(dashboard?.avgOrderValue || 0)} precision={0} formatter={(v) => formatMoney(v)} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Chênh lệch đối soát tồn kho"
                            value={Number(reconciliation?.inventoryGap || 0)}
                            precision={0}
                            valueStyle={{ color: Number(reconciliation?.inventoryGap || 0) === 0 ? '#3f8600' : '#cf1322' }}
                            formatter={(v) => formatMoney(v)}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs
                style={{ marginTop: 16 }}
                items={[
                    {
                        key: 'dashboard',
                        label: 'Dashboard lợi nhuận',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card title="Doanh thu - Chi phí - Lợi nhuận theo tháng">
                                        <div style={{ width: '100%', height: 340 }}>
                                            <ResponsiveContainer>
                                                <LineChart data={monthlyTrendData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="period" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="revenue" stroke="#1677ff" name="Doanh thu" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="expense" stroke="#fa8c16" name="Chi phí" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="cogs" stroke="#722ed1" name="Giá vốn" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="profit" stroke="#52c41a" name="Lợi nhuận" strokeWidth={3} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} lg={12}>
                                    <Card title="Tỉ lệ sản phẩm bán ra">
                                        <div style={{ width: '100%', height: 320 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={productRatioChartData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        outerRadius={110}
                                                        label={(entry) => `${entry.name}: ${entry.ratio}%`}
                                                    >
                                                        {productRatioChartData.map((entry, index) => (
                                                            <Cell key={`product-cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `${value} sp`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} lg={12}>
                                    <Card title="Cơ cấu chi phí">
                                        <div style={{ width: '100%', height: 320 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={expenseCategoryData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="category" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                                    <Bar dataKey="amount" fill="#fa8c16" name="Chi phí" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={24}>
                                    <Card title="Tỉ trọng doanh thu theo phương thức thanh toán">
                                        <div style={{ width: '100%', height: 320 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={paymentMethodData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="method" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                                    <Bar dataKey="amount" name="Doanh thu" fill="#1677ff" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'coa',
                        label: 'Hệ thống tài khoản',
                        children: <Table rowKey="id" dataSource={coaRows} columns={coaColumns} loading={loading} />,
                    },
                    {
                        key: 'journal',
                        label: 'Nhật ký chung',
                        children: (
                            <Table
                                rowKey="id"
                                dataSource={journalRows}
                                columns={journalColumns}
                                loading={loading}
                                scroll={{ x: 1200 }}
                            />
                        ),
                    },
                    {
                        key: 'ar',
                        label: 'Công nợ phải thu',
                        children: <Table rowKey="documentCode" dataSource={arRows} columns={arColumns} loading={loading} />,
                    },
                    {
                        key: 'ap',
                        label: 'Công nợ phải trả',
                        children: <Table rowKey="documentCode" dataSource={apRows} columns={apColumns} loading={loading} />,
                    },
                    {
                        key: 'receipt',
                        label: 'Phiếu thu',
                        children: (
                            <Table
                                rowKey={(row) => `${row.voucherCode}-${row.voucherDate || ''}`}
                                dataSource={cashReceiptRows}
                                columns={cashVoucherColumns}
                                loading={loading}
                                scroll={{ x: 1200 }}
                            />
                        ),
                    },
                    {
                        key: 'payment',
                        label: 'Phiếu chi',
                        children: (
                            <Table
                                rowKey={(row) => `${row.voucherCode}-${row.voucherDate || ''}`}
                                dataSource={cashPaymentRows}
                                columns={cashVoucherColumns}
                                loading={loading}
                                scroll={{ x: 1200 }}
                            />
                        ),
                    },
                    {
                        key: 'reco',
                        label: 'Đối soát',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Giá trị sổ kho"
                                            value={Number(reconciliation?.inventoryLedgerValue || 0)}
                                            formatter={(v) => formatMoney(v)}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Giá trị lớp nhập"
                                            value={Number(reconciliation?.inventoryLayerValue || 0)}
                                            formatter={(v) => formatMoney(v)}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Chênh lệch"
                                            value={Number(reconciliation?.inventoryGap || 0)}
                                            valueStyle={{ color: Number(reconciliation?.inventoryGap || 0) === 0 ? '#3f8600' : '#cf1322' }}
                                            formatter={(v) => formatMoney(v)}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Statistic title="Số dòng inventory" value={Number(reconciliation?.inventoryRowCount || 0)} />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Statistic title="Số dòng receipt layer" value={Number(reconciliation?.layerRowCount || 0)} />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                ]}
            />
        </div>
    );
}

export default AccountingAd;
