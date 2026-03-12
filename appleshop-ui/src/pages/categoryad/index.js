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
      title: "Category",
      dataIndex: "name"
    },
    {
      title: "Code",
      dataIndex: "code"
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRowCategory(record)}
          />

          <Popconfirm
            title="Delete category?"
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
        <h3>Categories</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisibleAdd(true)}
        >
          Add Category
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