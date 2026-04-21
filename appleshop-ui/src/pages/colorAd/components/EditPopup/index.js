import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ColorService } from "~/service/colorService";

function EditColorModal({ open, onClose, data, refresh }) {
  const colorService = new ColorService();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      color: "",
      code: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        color: data.color,
        code: data.code,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      id: data.id,
    };

    await colorService.edit(payload);

    refresh();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Sửa màu"
      footer={null}
      centered
      onCancel={onClose}
      afterClose={() => {
        document.body.style.overflow = "";
        document.body.style.width = "";
        document.body.classList.remove("ant-scrolling-effect");
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item label="Tên màu">
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Nhập tên màu" />
            )}
          />
        </Form.Item>

        <Form.Item label="Mã màu">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="#000000" />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Cập nhật màu
        </Button>
      </form>
    </Modal>
  );
}

export default EditColorModal;