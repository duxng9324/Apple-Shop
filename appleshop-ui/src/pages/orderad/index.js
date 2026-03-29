import { useEffect, useState } from "react";
import { Button, Card, Table, Select, Tag, Typography, Image, Space, message } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { OrderService } from "~/service/orderService";

const { Title, Text } = Typography;

const statusOptions = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Đơn hàng đã được hoàn thành",
  "Hủy đơn hàng",
];

function OrderAd() {
  const [orders, setOrders] = useState([]);
  const [filterValue, setFilterValue] = useState("all");
  const [issueStrategy, setIssueStrategy] = useState("FIFO");
  const orderService = new OrderService();

  const fetchOrders = async () => {
    const res = await orderService.viewAll();
    setOrders(res || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangeStatus = async (value, order) => {
    try {
      const updated = { ...order, status: value, strategy: issueStrategy };
      await orderService.changeStatus(updated);
      fetchOrders();
    } catch (error) {
      message.error("Không thể xác nhận đơn do tồn kho không đủ hoặc chưa có lớp nhập kho phù hợp.");
    }
  };

  const handleMarkPaid = async (order) => {
    try {
      await orderService.markPaid({ id: order.id });
      message.success("Đơn hàng đã được ghi nhận thanh toán");
      fetchOrders();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái thanh toán");
    }
  };

  const filteredOrders =
    filterValue === "all"
      ? orders
      : orders.filter((o) => o.status === filterValue);

  const productColumns = [
    {
      title: "Sản phẩm",
      render: (_, item) => (
        <Space>
          <Image width={60} src={item.image} />
          <Text>
            {item.name} {item.memory} {item.color}
          </Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
    },
    {
      title: "Thành tiền",
      render: (_, item) => (
        <div>
          <Text strong>
            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
          </Text>
          <br />
          <Text delete type="secondary">
            {(item.price * 1.2 * item.quantity).toLocaleString("vi-VN")}đ
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Title level={3}>Quản lý đơn hàng</Title>

          <Space>
            <FilterOutlined />
            <Select
              value={issueStrategy}
              style={{ width: 120 }}
              onChange={setIssueStrategy}
              options={[
                { value: "FIFO", label: "FIFO" },
                { value: "LIFO", label: "LIFO" },
              ]}
            />
            <Select
              value={filterValue}
              style={{ width: 220 }}
              onChange={setFilterValue}
              options={[
                { value: "all", label: "Tất cả" },
                ...statusOptions.map((s) => ({ value: s, label: s })),
              ]}
            />
          </Space>
        </Space>

        {filteredOrders.map((order) => {
          const orderTime = new Date(order.orderTime).toLocaleString();

          return (
            <Card
              key={order.sku}
              type="inner"
              title={
                <Space>
                  <Text strong>Mã đơn:</Text>
                  <Tag color="blue">{order.sku}</Tag>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Khách hàng:</Text> {order.fullName}
                </div>

                <div>
                  <Text strong>Điện thoại:</Text> {order.orderPhone}
                </div>

                <div>
                  <Text strong>Email:</Text> {order.email}
                </div>

                <div>
                  <Text strong>Địa chỉ:</Text> {order.orderAddress}
                </div>

                <div>
                  <Text strong>Thời gian đặt:</Text> {orderTime}
                </div>

                <Table
                  columns={productColumns}
                  dataSource={order.orderItemDTOs}
                  pagination={false}
                  rowKey={(r, i) => i}
                />

                <Space
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  <Space>
                    <Text strong>Trạng thái:</Text>

                    <Select
                      value={order.status}
                      style={{ width: 220 }}
                      onChange={(value) =>
                        handleChangeStatus(value, order)
                      }
                      options={statusOptions.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    />

                    {order.paymentStatus !== "Đã thanh toán" && (
                      <Button type="primary" onClick={() => handleMarkPaid(order)}>
                        Xác nhận đã thu tiền
                      </Button>
                    )}
                  </Space>

                  <Text strong style={{ fontSize: 16 }}>
                    Tổng: {order.totalPrice.toLocaleString("vi-VN")}đ
                  </Text>
                </Space>
              </Space>
            </Card>
          );
        })}

    </div>
  );
}

export default OrderAd;