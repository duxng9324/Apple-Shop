import { Modal, Form, Input, Button } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ColorService } from "~/service/colorService";

const schema = yup.object({
  color: yup.string().required("Vui lòng nhập tên màu"),
  code: yup.string().required("Vui lòng nhập mã màu"),
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
      title="Thêm màu"
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
          label="Tên màu"
          validateStatus={errors.color && "error"}
          help={errors.color?.message}
        >
          <Input placeholder="Nhập tên màu" {...register("color")} />
        </Form.Item>

        <Form.Item
          label="Mã màu"
          validateStatus={errors.code && "error"}
          help={errors.code?.message}
        >
          <Input placeholder="#000000" {...register("code")} />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Thêm màu
        </Button>
      </form>
    </Modal>
  );
}

export default AddColorModal;