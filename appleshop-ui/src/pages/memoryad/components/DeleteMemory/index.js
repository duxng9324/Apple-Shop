import { Modal } from "antd";
import { MemoryService } from "~/service/memoryService";

const memoryService = new MemoryService();

export const confirmDeleteMemory = (record, refresh) => {
  Modal.confirm({
    title: "Delete Memory",
    content: `Are you sure delete ${record.type}?`,
    okText: "Delete",
    okType: "danger",
    onOk: async () => {
      await memoryService.remove({id: record.id});
      refresh();
    },
  });
};