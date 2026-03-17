import { Modal, Form, Input, Button } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ColorService } from "~/service/colorService";

const schema = yup.object({
  color: yup.string().required("Please enter color name"),
  code: yup.string().required("Please enter color code"),
});

function AddColorModal({ open, onClose, refresh }) {
  const colorService = new ColorService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    await colorService.add(data);
    refresh();
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Add Color"
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
        <Form.Item
          label="Color"
          validateStatus={errors.color && "error"}
          help={errors.color?.message}
        >
          <Input placeholder="Enter color name" {...register("color")} />
        </Form.Item>

        <Form.Item
          label="Color Code"
          validateStatus={errors.code && "error"}
          help={errors.code?.message}
        >
          <Input placeholder="#000000" {...register("code")} />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Add Color
        </Button>
      </form>
    </Modal>
  );
}

export default AddColorModal;