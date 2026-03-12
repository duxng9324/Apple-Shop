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
      message.success("Memory updated successfully");
      refresh();
      onClose();
    } catch (error) {
      message.error("Update failed");
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Memory"
      footer={null}
      onCancel={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item label="Memory Type">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Input {...field} />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Update Memory
        </Button>
      </form>
    </Modal>
  );
}

export default EditMemoryModal;