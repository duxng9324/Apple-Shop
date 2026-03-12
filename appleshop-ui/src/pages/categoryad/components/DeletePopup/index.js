<Popconfirm
  title="Delete category?"
  description="This action cannot be undone"
  onConfirm={() => handleDelete(record.id)}
>
  <Button danger icon={<DeleteOutlined />} />
</Popconfirm>