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
      message.success("Cập nhật danh mục thành công");
      onClose();
      reload();
    } catch (error) {
      message.error("Cập nhật danh mục thất bại");
    }
  };

  return (
    <Modal
      open={open}
      title="Sửa danh mục"
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
          label="Tên danh mục"
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã danh mục"
          name="code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Cập nhật
        </Button>
      </Form>
    </Modal>
  );
}

export default EditCategoryModal;