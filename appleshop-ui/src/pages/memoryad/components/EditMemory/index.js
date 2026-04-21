import { Modal, Form, Input, Button, message } from "antd";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { MemoryService } from "~/service/memoryService";

function EditMemoryModal({ open, onClose, data, refresh }) {
  const memoryService = new MemoryService();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      type: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        type: data.type,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      id: data.id,
    };

    try {
      await memoryService.edit(payload);
      message.success("Cập nhật bộ nhớ thành công");
      refresh();
      onClose();
    } catch (error) {
      message.error("Cập nhật bộ nhớ thất bại");
    }
  };

  return (
    <Modal
      open={open}
      title="Sửa bộ nhớ"
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
        <Form.Item label="Loại bộ nhớ">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Input {...field} />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Cập nhật bộ nhớ
        </Button>
      </form>
    </Modal>
  );
}

export default EditMemoryModal;