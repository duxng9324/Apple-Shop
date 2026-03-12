import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  InputNumber
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ProductService } from "~/service/productService";

function AddProductModal({
  open,
  onClose,
  categories,
  colors,
  memories,
  refresh
}) {
  const [form] = Form.useForm();
  const productService = new ProductService();

  const onFinish = async (values) => {
    const payload = {
      ...values,
      imgLinks: values.imgLinks,
      list: values.list
    };

    await productService.add(payload);

    refresh();
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Add Product"
      footer={null}
      width={800}
      onCancel={onClose}
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
        >
          <Input.TextArea />
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
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                Add Image
              </Button>
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

              <Button
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
          block
        >
          Add Product
        </Button>
      </Form>
    </Modal>
  );
}

export default AddProductModal;