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
  const productService = new ProductService();

  const onFinish = async (values) => {
    const payload = {
      ...values,
      id: data.id,
      imgLinks: values.imgLinks.join(" ")
    };

    await productService.edit(payload);

    refresh();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Edit Product"
      footer={null}
      width={800}
      onCancel={onClose}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          name: data?.name,
          code: data?.code,
          description: data?.description,
          categoryCode: data?.categoryDTO?.code,
          colors: data?.colorDTOs?.map((c) => c.id),
          imgLinks: data?.imgLinks,
          list: data?.list
        }}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Category" name="categoryCode">
          <Select>
            {categories.map((c) => (
              <Select.Option key={c.code} value={c.code}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Colors" name="colors">
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

        <Button type="primary" htmlType="submit" block>
          Update Product
        </Button>
      </Form>
    </Modal>
  );
}

export default EditProductModal;