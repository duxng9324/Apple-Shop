import { Modal } from "antd";
import { ColorService } from "~/service/colorService";

const colorService = new ColorService();

export const confirmDeleteColor = (record, refresh) => {
  Modal.confirm({
    centered: true,
    title: "Delete Color",
    content: `Are you sure to delete ${record.color}?`,
    okText: "Delete",
    okType: "danger",
    afterClose: () => {
      document.body.style.overflow = "";
      document.body.style.width = "";
      document.body.classList.remove("ant-scrolling-effect");
    },
    onOk: async () => {
      await colorService.remove({id: record.id});
      refresh();
    },
  });
};