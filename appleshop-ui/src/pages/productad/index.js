import {
  Table,
  Button,
  Space,
  Image,
  Tag,
  Popconfirm,
  message
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { useEffect, useState } from "react";

import { ProductService } from "~/service/productService";
import { CategoryService } from "~/service/categoryService";
import { ColorService } from "~/service/colorService";
import { MemoryService } from "~/service/memoryService";
import EditProductModal from "./components/EditProduct";
import AddProductModal from "./components/AddProduct";

function ProductAd() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [memories, setMemories] = useState([]);

  const [rowProduct, setRowProduct] = useState(null);
  const [visibleAdd, setVisibleAdd] = useState(false);

  const productService = new ProductService();

  const fetchProducts = async () => {
    const res = await productService.view();
    setProducts(res);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    new CategoryService().view().then(setCategories);
    new ColorService().view().then(setColors);
    new MemoryService().view().then(setMemories);
  }, []);

  const handleDelete = async (id) => {
    try {
      await productService.remove({id});
      message.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      message.error(error?.response?.data || "Xóa sản phẩm thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70
    },
    {
      title: "Name",
      dataIndex: "name"
    },
    {
      title: "Code",
      dataIndex: "code"
    },
    {
      title: "Images",
      dataIndex: "imgLinks",
      render: (imgLinks) => {
        const links = imgLinks || [];

        return (
          <Space>
            {links.map((link, i) => (
              <Image key={i} width={40} src={link} />
            ))}
          </Space>
        );
      }
    },
    {
      title: "Memory Price",
      dataIndex: "list",
      render: (list) => (
        <Space direction="vertical">
          {list.map((item, i) => (
            <div key={i}>
              <Tag color="blue">{item.type}</Tag>
              {item.price.toLocaleString()} VNĐ
            </div>
          ))}
        </Space>
      )
    },
    {
      title: "Color",
      dataIndex: "colorDTOs",
      render: (colors) => (
        <Space>
          {colors.map((c, i) => (
            <Tag key={i}>{c.color}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: "Category",
      dataIndex: "categoryDTO",
      render: (c) => c?.name
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRowProduct(record)}
          />

          <Popconfirm
            title="Delete product?"
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
        <h3>Products</h3>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisibleAdd(true)}
        >
          Publish Product
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        scroll={{ x: 1200 }}
      />

      <AddProductModal
        open={visibleAdd}
        onClose={() => setVisibleAdd(false)}
        products={products}
        categories={categories}
        colors={colors}
        memories={memories}
        refresh={fetchProducts}
      />

      <EditProductModal
        open={!!rowProduct}
        onClose={() => setRowProduct(null)}
        data={rowProduct}
        categories={categories}
        colors={colors}
        memories={memories}
        refresh={fetchProducts}
      />
    </>
  );
}

export default ProductAd;