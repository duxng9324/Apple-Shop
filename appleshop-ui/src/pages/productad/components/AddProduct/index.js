import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  InputNumber,
  Upload,
  message
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { ProductService } from "~/service/productService";
import { ImageService } from "~/service/imageService";

import "@uiw/react-md-editor/markdown-editor.css";

function AddProductModal({
  open,
  onClose,
  categories,
  colors,
  memories,
  refresh
}) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [productFiles, setProductFiles] = useState([]);
  const productService = new ProductService();
  const imageService = new ImageService();

  const onFinish = async (values) => {
    setUploading(true);
    try {
      let uploadedUrls = [];
      if (productFiles.length > 0) {
        const rawFiles = productFiles
          .map((item) => item.originFileObj)
          .filter(Boolean);
        uploadedUrls = await imageService.uploadProductImages(rawFiles);
      }

      const manualLinks = (values.imgLinks || []).filter((item) => item && item.trim());
      const imgLinks = [...manualLinks, ...uploadedUrls];
      if (imgLinks.length === 0) {
        message.error("Vui lòng thêm ít nhất 1 ảnh sản phẩm");
        return;
      }

      const payload = {
        ...values,
        imgLinks,
        list: values.list
      };

      await productService.add(payload);
      message.success("Thêm sản phẩm thành công");
      refresh();
      onClose();
      form.resetFields();
      setProductFiles([]);
    } catch (error) {
      message.error(error?.response?.data || "Upload ảnh hoặc thêm sản phẩm thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Add Product"
      footer={null}
      width={800}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto"
        }
      }}
      onCancel={onClose}
      afterClose={() => {
        document.body.style.overflow = "";
        document.body.style.width = "";
        document.body.classList.remove("ant-scrolling-effect");
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
          extra="Hỗ trợ Markdown: ## tiêu đề, **bold**, *italic*, - danh sách, [link](url)."
          valuePropName="value"
          getValueFromEvent={(value) => value || ""}
        >
          <MDEditor
            preview="edit"
            height={280}
            visibleDragbar={false}
            textareaProps={{ placeholder: "Nhập mô tả sản phẩm dạng Markdown" }}
          />
        </Form.Item>

        <Form.Item
          label="Category"
          name="categoryCode"
          rules={[{ required: true }]}
        >
          <Select>
            {categories.map((c) => (
              <Select.Option
                key={c.code}
                value={c.code}
              >
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Colors"
          name="colors"
          rules={[{ required: true }]}
        >
          <Checkbox.Group>
            <Space wrap>
              {colors.map((c) => (
                <Checkbox key={c.id} value={c.id}>
                  {c.color}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>

        {/* Images */}
        <Form.List name="imgLinks">
          {(fields, { add, remove }) => (
            <>
              <label>Images</label>

              {fields.map((field) => (
                <Space key={field.key}>
                  <Form.Item
                    {...field}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Image link" />
                  </Form.Item>

                  <MinusCircleOutlined
                    onClick={() => remove(field.name)}
                  />
                </Space>
              ))}

              <Button
                style={{margin: "0 10px"}}
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                Add Image
              </Button>

              <Upload
                style={{margin: "0 10px"}}
                multiple
                listType="picture"
                fileList={productFiles}
                beforeUpload={() => false}
                onChange={({ fileList }) => setProductFiles(fileList)}
              >
                <Button icon={<PlusOutlined />}>Upload Images</Button>
              </Upload>
            </>
          )}
        </Form.List>

        {/* Memory Price */}
        <Form.List name="list">
          {(fields, { add, remove }) => (
            <>
              <label>Memory - Price</label>

              {fields.map((field) => (
                <Space key={field.key}>
                  <Form.Item
                    {...field}
                    name={[field.name, "type"]}
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Memory">
                      {memories.map((m) => (
                        <Select.Option
                          key={m.id}
                          value={m.type}
                        >
                          {m.type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, "price"]}
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      placeholder="Price"
                      min={0}
                    />
                  </Form.Item>

                  <MinusCircleOutlined
                    onClick={() => remove(field.name)}
                  />
                </Space>
              ))}

              <Button style={{margin: "0 10px"}}
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                Add Memory
              </Button>
            </>
          )}
        </Form.List>

        <Button
          type="primary"
          htmlType="submit"
          loading={uploading}
          block
        >
          Add Product
        </Button>
      </Form>
    </Modal>
  );
}

export default AddProductModal;