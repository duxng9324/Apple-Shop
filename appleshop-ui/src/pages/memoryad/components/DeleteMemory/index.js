import { Modal } from "antd";
import { MemoryService } from "~/service/memoryService";

const memoryService = new MemoryService();

export const confirmDeleteMemory = (record, refresh) => {
  Modal.confirm({
    centered: true,
    title: "Delete Memory",
    content: `Are you sure delete ${record.type}?`,
    okText: "Delete",
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