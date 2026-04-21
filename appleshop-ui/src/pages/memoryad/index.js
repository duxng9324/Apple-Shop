import { Table, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { MemoryService } from "~/service/memoryService";
import AddMemoryModal from "./components/AddMemory";
import EditMemoryModal from "./components/EditMemory";
import { confirmDeleteMemory } from "./components/DeleteMemory";

function MemoryAd() {
  const [memories, setMemories] = useState([]);
  const [rowMemory, setRowMemory] = useState(null);
  const [visibleAdd, setVisibleAdd] = useState(false);

  const memoryService = new MemoryService();

  const fetchData = async () => {
    const res = await memoryService.view();
    setMemories(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Loại bộ nhớ",
      dataIndex: "type",
    },
    {
      title: "Thao tác",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRowMemory(record)}
          />

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDeleteMemory(record, fetchData)}
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
        <h3>Quản lý bộ nhớ</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisibleAdd(true)}
        >
          Thêm bộ nhớ
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={memories}
        rowKey="id"
        bordered
      />

      <AddMemoryModal
        open={visibleAdd}
        onClose={() => setVisibleAdd(false)}
        refresh={fetchData}
      />

      <EditMemoryModal
        open={!!rowMemory}
        onClose={() => setRowMemory(null)}
        data={rowMemory}
        refresh={fetchData}
      />
    </>
  );
}

export default MemoryAd;