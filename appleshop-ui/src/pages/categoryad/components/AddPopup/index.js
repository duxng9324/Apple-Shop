import { Modal, Form, Input, Button, message } from "antd";
import { CategoryService } from "~/service/categoryService";

function AddCategoryModal({ open, onClose, reload }) {
  const [form] = Form.useForm();
  const categoryService = new CategoryService();

  const handleSubmit = async (values) => {
    try {
      await categoryService.add(values);
      message.success("Category added");
      form.resetFields();
      onClose();
      reload();
    } catch (error) {
      message.error("Add failed");
    }
  };

  return (
    <Modal
      open={open}
      title="Add Category"
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          label="Category Code"
          name="code"
          rules={[{ required: true, message: "Please enter code" }]}
        >
          <Input placeholder="Enter category code" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Add
        </Button>
      </Form>
    </Modal>
  );
}

export default AddCategoryModal;