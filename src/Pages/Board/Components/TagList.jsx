import React, { useState } from "react";
import { Tag, Button, Input, Modal, Form, Select, Flex, Popconfirm } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "react-query";
import { createPriority, deletePriority, getPriorities, updatePriority } from "../../../api"; // Импортируйте функции для создания и обновления приоритетов

const { Option } = Select;

const TagList = ({ boardId }) => {
  const { data: priorities } = useQuery(["priorities", boardId], () => getPriorities(boardId));
  const [inputVisible, setInputVisible] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("");
  const [editTag, setEditTag] = useState(null);
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();
  const handleAddTag = async () => {
    if (tagName && tagColor) {
      await createPriority({ name: tagName, color: tagColor }, boardId);
      setTagName("");
      setTagColor("");
      setInputVisible(false);
      queryClient.invalidateQueries(["priorities", boardId]);
    }
  };

  const handleEdit = (index) => {
    setEditTag(index);
    setVisible(true);
  };

  const handleEditOk = () => {
    setVisible(false);
    setEditTag(null);
  };

  const handleEditCancel = () => {
    setVisible(false);
    setEditTag(null);
  };

  const handleSaveEdit = async (index, editedTag) => {
    await updatePriority(editedTag, boardId, priorities[index].id);
    queryClient.invalidateQueries(["priorities", boardId]);
  };
  const handleDelete = async (priorityId) => {
    await deletePriority(boardId, priorityId);
    queryClient.invalidateQueries(["columns"]);
    queryClient.invalidateQueries(["priorities"]);
  };
  return (
    <div>
      {priorities?.map((priority, index) => (
        <Tag key={index} color={priority.color} style={{ marginBottom: "8px" }}>
          {priority.name}
          <EditOutlined style={{ marginLeft: "8px", cursor: "pointer" }} onClick={() => handleEdit(index)} />
          <Popconfirm title="Вы действительно хотите удалить метку?" onConfirm={() => handleDelete(priority.id)} okText="Да" cancelText="Нет">
            <CloseOutlined style={{ cursor: "pointer" }} />
          </Popconfirm>
        </Tag>
      ))}

      {inputVisible ? (
        <Flex>
          <Input
            size="small"
            style={{ width: "80px", marginRight: "8px" }}
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Название"
          />
          <Select
            size="small"
            style={{ width: "80px", marginRight: "8px" }}
            value={tagColor}
            onChange={(value) => setTagColor(value)}
            placeholder="Цвет">
            <Option value="red">Красный</Option>
            <Option value="blue">Синий</Option>
            <Option value="green">Зеленый</Option>
          </Select>
          <Flex style={{ gap: "8px" }}>
            <Button size="small" onClick={handleAddTag}>
              Добавить
            </Button>
            <Button
              size="small"
              onClick={() => {
                setTagName("");
                setTagColor("");
                setInputVisible(false);
              }}>
              Отмена
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Button size="small" type="dashed" onClick={() => setInputVisible(true)}>
          + Метка
        </Button>
      )}
      <Modal title="Edit Tag" visible={visible} onCancel={handleEditCancel} footer={null}>
        <EditTagForm index={editTag} tag={editTag !== null ? priorities[editTag] : null} onSave={handleSaveEdit} />
      </Modal>
    </div>
  );
};

const EditTagForm = ({ index, tag, onSave }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(tag);
  }, [tag, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave(index, { ...tag, name: values.name, color: values.color });
      form.resetFields();
    });
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Название" rules={[{ required: true, message: "Введите название" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="color" label="Цвет" rules={[{ required: true, message: "Выберите цвет" }]}>
        <Select>
          <Option value="red">Красный</Option>
          <Option value="blue">Синий</Option>
          <Option value="green">Зеленый</Option>
        </Select>
      </Form.Item>
      <Flex style={{ justifyContent: "right", gap: "8px" }}>
        <Button type="primary" onClick={handleSave}>
          Сохранить
        </Button>
        <Button onClick={handleSave}>Отмена</Button>
      </Flex>
    </Form>
  );
};

export default TagList;
