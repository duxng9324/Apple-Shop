<Popconfirm
  title="Xóa danh mục này?"
  description="Hành động này không thể hoàn tác"
  onConfirm={() => handleDelete(record.id)}
>
  <Button danger icon={<DeleteOutlined />} />
</Popconfirm>