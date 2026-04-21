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
      message.success("Thêm bộ nhớ thành công");
      refresh();
      reset();
      onClose();
    } catch (error) {
      message.error("Thêm bộ nhớ thất bại");
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm bộ nhớ"
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
              <Input {...field} placeholder="Ví dụ: 8GB / 16GB" />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Thêm bộ nhớ
        </Button>
      </form>
    </Modal>
  );
}

export default AddMemoryModal;