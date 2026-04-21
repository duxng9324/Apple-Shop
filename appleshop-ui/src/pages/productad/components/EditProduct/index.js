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
import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { ProductService } from "~/service/productService";
import { ImageService } from "~/service/imageService";

import "@uiw/react-md-editor/markdown-editor.css";

function EditProductModal({
  open,
  onClose,
  data,
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

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setProductFiles([]);
      return;
    }

    if (data) {
      form.setFieldsValue({
        name: data.name,
        code: data.code,
        description: data.description,
        categoryCode: data.categoryDTO?.code,
        colors: data.colorDTOs?.map((c) => c.id),
        imgLinks: data.imgLinks,
        list: data.list
      });
    }
  }, [open, data, form]);

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

      const payload = {
        ...values,
        id: data?.id,
        imgLinks
      };

      await productService.edit(payload);
      message.success("Cập nhật sản phẩm thành công");
      refresh();
      onClose();
      setProductFiles([]);
    } catch (error) {
      message.error(error?.response?.data || "Upload ảnh hoặc cập nhật sản phẩm thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Sửa sản phẩm"
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
        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Mã sản phẩm" name="code" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
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

        <Form.Item label="Danh mục" name="categoryCode">
          <Select>
            {categories.map((c) => (
              <Select.Option key={c.code} value={c.code}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Màu sắc" name="colors">
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

        <Form.List name="imgLinks">
          {(fields, { add, remove }) => (
            <>
              <label>Hình ảnh</label>

              {fields.map((field) => (
                <Space key={field.key}>
                  <Form.Item {...field} rules={[{ required: true }]}>
                    <Input placeholder="Đường dẫn hình ảnh" />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}

              <Button style={{margin: "0 10px"}} icon={<PlusOutlined />} onClick={() => add()}>
                Thêm hình ảnh
              </Button>

              <Upload
                style={{margin: "0 10px"}}
                multiple
                listType="picture"
                fileList={productFiles}
                beforeUpload={() => false}
                onChange={({ fileList }) => setProductFiles(fileList)}
              >
                <Button style={{margin: "0 10px"}} icon={<PlusOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </>
          )}
        </Form.List>

        {/* Memory Price */}
        <Form.List name="list">
          {(fields, { add, remove }) => (
            <>
              <label>Bộ nhớ - Giá</label>

              {fields.map((field) => (
                <Space key={field.key}>
                  <Form.Item
                    {...field}
                    name={[field.name, "type"]}
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Bộ nhớ">
                      {memories.map((m) => (
                        <Select.Option key={m.id} value={m.type}>
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
                    <InputNumber placeholder="Giá" min={0} />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}

              <Button style={{ margin: "0 10px" }} icon={<PlusOutlined />} onClick={() => add()}>
                Thêm bộ nhớ
              </Button>
            </>
          )}
        </Form.List>

        <Button type="primary" htmlType="submit" loading={uploading} block>
          Cập nhật sản phẩm
        </Button>
      </Form>
    </Modal>
  );
}

export default EditProductModal;