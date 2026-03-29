import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';

import { AccountingService } from '~/service/accountingService';

const { Title, Text } = Typography;

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

    const [coaRows, setCoaRows] = useState([]);
    const [journalRows, setJournalRows] = useState([]);
    const [arRows, setArRows] = useState([]);
    const [apRows, setApRows] = useState([]);
    const [reconciliation, setReconciliation] = useState(null);

    const [journalFrom, setJournalFrom] = useState(dayjs().startOf('month'));
    const [journalTo, setJournalTo] = useState(dayjs().endOf('month'));
    const [agingDate, setAgingDate] = useState(dayjs());

    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        const from = journalFrom.format('YYYY-MM-DD');
        const to = journalTo.format('YYYY-MM-DD');
        const asOf = agingDate.format('YYYY-MM-DD');

        try {
            setLoading(true);
            const [coa, journal, ar, ap, reco] = await Promise.all([
                accountingService.getChartOfAccounts(),
                accountingService.getJournal({ from, to }),
                accountingService.getReceivableAging({ asOf }),
                accountingService.getPayableAging({ asOf }),
                accountingService.getReconciliationSummary(),
            ]);

            setCoaRows(coa || []);
            setJournalRows(journal || []);
            setArRows(ar || []);
            setApRows(ap || []);
            setReconciliation(reco || null);
        } catch (error) {
            message.error('Không thể tải dữ liệu kế toán');
        } finally {
            setLoading(false);
        }
    }, [accountingService, agingDate, journalFrom, journalTo]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalAR = arRows.reduce((acc, item) => acc + Number(item.outstandingAmount || 0), 0);
    const totalAP = apRows.reduce((acc, item) => acc + Number(item.outstandingAmount || 0), 0);

    const coaColumns = [
        { title: 'Mã TK', dataIndex: 'accountCode', width: 120 },
        { title: 'Tên tài khoản', dataIndex: 'accountName' },
        { title: 'Loại', dataIndex: 'accountType', width: 140 },
        { title: 'Số dư chuẩn', dataIndex: 'normalBalance', width: 140 },
        {
            title: 'Trạng thái',
            width: 120,
            render: (_, row) => (row.active ? <Tag color="green">ACTIVE</Tag> : <Tag color="default">INACTIVE</Tag>),
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
            title: 'Post',
            width: 120,
            render: (_, row) =>
                row.postingStatus === 'POSTED' ? <Tag color="green">POSTED</Tag> : <Tag color="orange">DRAFT</Tag>,
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
            render: (_, row) => (row.status === 'OPEN' ? <Tag color="red">OPEN</Tag> : <Tag color="green">CLOSED</Tag>),
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
            render: (_, row) => (row.status === 'OPEN' ? <Tag color="volcano">OPEN</Tag> : <Tag color="green">CLOSED</Tag>),
        },
    ];

    return (
        <div>
            <Title level={3}>Accounting Center</Title>
            <Text type="secondary">
                Khu vực kế toán tổng hợp cho Journal, Chart of Accounts, AR/AP Aging và đối soát kho - kế toán.
            </Text>

            <Card style={{ marginTop: 16 }}>
                <Space wrap>
                    <DatePicker value={journalFrom} onChange={(v) => setJournalFrom(v || dayjs().startOf('month'))} />
                    <DatePicker value={journalTo} onChange={(v) => setJournalTo(v || dayjs().endOf('month'))} />
                    <DatePicker value={agingDate} onChange={(v) => setAgingDate(v || dayjs())} />
                    <Button type="primary" onClick={loadData} loading={loading}>
                        Tải dữ liệu
                    </Button>
                </Space>
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
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
                        key: 'coa',
                        label: 'Chart Of Accounts',
                        children: <Table rowKey="id" dataSource={coaRows} columns={coaColumns} loading={loading} />,
                    },
                    {
                        key: 'journal',
                        label: 'Journal',
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
                        label: 'AR Aging',
                        children: <Table rowKey="documentCode" dataSource={arRows} columns={arColumns} loading={loading} />,
                    },
                    {
                        key: 'ap',
                        label: 'AP Aging',
                        children: <Table rowKey="documentCode" dataSource={apRows} columns={apColumns} loading={loading} />,
                    },
                    {
                        key: 'reco',
                        label: 'Reconciliation',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Inventory Ledger Value"
                                            value={Number(reconciliation?.inventoryLedgerValue || 0)}
                                            formatter={(v) => formatMoney(v)}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Receipt Layer Value"
                                            value={Number(reconciliation?.inventoryLayerValue || 0)}
                                            formatter={(v) => formatMoney(v)}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Gap"
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
