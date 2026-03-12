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
    <Modal open={open} title="Edit Color" footer={null} onCancel={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item label="Color">
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter color name" />
            )}
          />
        </Form.Item>

        <Form.Item label="Color Code">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="#000000" />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Update Color
        </Button>
      </form>
    </Modal>
  );
}

export default EditColorModal;