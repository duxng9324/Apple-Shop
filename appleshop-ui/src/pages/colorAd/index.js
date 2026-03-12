import { Table, Button, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ColorService } from "~/service/colorService";
import AddColorModal from "./components/AddPopup";
import EditColorModal from "./components/EditPopup";
import { confirmDeleteColor } from "./components/DeletePopup";

function ColorAd() {
  const [colors, setColors] = useState([]);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [rowColor, setRowColor] = useState(null);

  const colorService = new ColorService();

  const fetchData = async () => {
    const res = await colorService.view();
    setColors(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Color",
      dataIndex: "color",
    },
    {
      title: "Code",
      dataIndex: "code",
      render: (code) => <Tag color={code}>{code}</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRowColor(record)}
          />

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDeleteColor(record, fetchData)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h3>Color Management</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisibleAdd(true)}
        >
          Add Color
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={colors}
        rowKey="id"
        bordered
      />

      <AddColorModal
        open={visibleAdd}
        onClose={() => setVisibleAdd(false)}
        refresh={fetchData}
      />

      <EditColorModal
        open={!!rowColor}
        onClose={() => setRowColor(null)}
        data={rowColor}
        refresh={fetchData}
      />
    </>
  );
}

export default ColorAd;