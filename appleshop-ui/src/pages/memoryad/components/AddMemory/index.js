import { Modal, Form, Input, Button, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { MemoryService } from "~/service/memoryService";

function AddMemoryModal({ open, onClose, refresh }) {
  const memoryService = new MemoryService();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      type: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await memoryService.add(data);
      message.success("Memory added successfully");
      refresh();
      reset();
      onClose();
    } catch (error) {
      message.error("Add memory failed");
    }
  };

  return (
    <Modal
      open={open}
      title="Add Memory"
      footer={null}
      onCancel={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Item label="Memory Type">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Ex: 8GB / 16GB" />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Add Memory
        </Button>
      </form>
    </Modal>
  );
}

export default AddMemoryModal;