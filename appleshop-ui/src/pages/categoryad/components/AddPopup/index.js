import { Modal, Form, Input, Button, message } from "antd";
import { CategoryService } from "~/service/categoryService";

function AddCategoryModal({ open, onClose, reload }) {
  const [form] = Form.useForm();
  const categoryService = new CategoryService();

  const handleSubmit = async (values) => {
    try {
      await categoryService.add(values);
      message.success("Thêm danh mục thành công");
      form.resetFields();
      onClose();
      reload();
    } catch (error) {
      message.error("Thêm danh mục thất bại");
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm danh mục"
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
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          label="Mã danh mục"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã danh mục" }]}
        >
          <Input placeholder="Nhập mã danh mục" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Thêm
        </Button>
      </Form>
    </Modal>
  );
}

export default AddCategoryModal;