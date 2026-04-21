import { Modal } from "antd";
import { MemoryService } from "~/service/memoryService";

const memoryService = new MemoryService();

export const confirmDeleteMemory = (record, refresh) => {
  Modal.confirm({
    centered: true,
    title: "Xóa bộ nhớ",
    content: `Bạn có chắc muốn xóa bộ nhớ ${record.type}?`,
    okText: "Xóa",
    okType: "danger",
    afterClose: () => {
      document.body.style.overflow = "";
      document.body.style.width = "";
      document.body.classList.remove("ant-scrolling-effect");
    },
    onOk: async () => {
      await memoryService.remove({id: record.id});
      refresh();
    },
  });
};