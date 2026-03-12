import { Modal } from "antd";
import { ColorService } from "~/service/colorService";

const colorService = new ColorService();

export const confirmDeleteColor = (record, refresh) => {
  Modal.confirm({
    title: "Delete Color",
    content: `Are you sure to delete ${record.color}?`,
    okText: "Delete",
    okType: "danger",
    onOk: async () => {
      await colorService.remove({id: record.id});
      refresh();
    },
  });
};