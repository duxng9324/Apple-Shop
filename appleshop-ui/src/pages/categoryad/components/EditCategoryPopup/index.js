import { Modal, Form, Input, Button, message } from "antd";
import { CategoryService } from "~/service/categoryService";
import { useEffect } from "react";

function EditCategoryModal({ open, data, onClose, reload }) {
  const [form] = Form.useForm();
  const categoryService = new CategoryService();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const handleSubmit = async (values) => {
    try {
      await categoryService.edit({ ...values, id: data.id });
      message.success("Category updated");
      onClose();
      reload();
    } catch (error) {
      message.error("Update failed");
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Category"
      onCancel={onClose}
      footer={null}
      centered
      afterClose={() => {
        document.body.style.overflow = "";
        document.body.style.width = "";
        document.body.classList.remove("ant-scrolling-effect");
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Category Code"
          name="code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Update
        </Button>
      </Form>
    </Modal>
  );
}

export default EditCategoryModal;