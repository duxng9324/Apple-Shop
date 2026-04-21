import { Table, Button, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { CategoryService } from "~/service/categoryService";
import AddCategoryModal from "./components/AddPopup";
import EditCategoryModal from "./components/EditCategoryPopup";

function CategoryAd() {
  const [categories, setCategories] = useState([]);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [rowCategory, setRowCategory] = useState(null);

  const categoryService = new CategoryService();

  const fetchData = async () => {
    const res = await categoryService.view();
    setCategories(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await categoryService.remove({id});
    fetchData();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id"
    },
    {
      title: "Danh mục",
      dataIndex: "name"
    },
    {
      title: "Mã",
      dataIndex: "code"
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRowCategory(record)}
          />

          <Popconfirm
            title="Xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <h3>Quản lý danh mục</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisibleAdd(true)}
        >
          Thêm danh mục
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        bordered
      />

      <AddCategoryModal
        open={visibleAdd}
        onClose={() => setVisibleAdd(false)}
        reload={fetchData}
      />

      <EditCategoryModal
        open={!!rowCategory}
        data={rowCategory}
        onClose={() => setRowCategory(null)}
        reload={fetchData}
      />
    </>
  );
}

export default CategoryAd;