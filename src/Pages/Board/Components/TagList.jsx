import React, { useState } from "react";
import { Tag, Button, Input, Modal, Form, Flex, Popconfirm, Popover } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "react-query";
import { createPriority, deletePriority, getPriorities, updatePriority } from "../../../api";

const TagList = ({ boardId }) => {
  const { data: priorities } = useQuery(["priorities", boardId], () => getPriorities(boardId));
  const [inputVisible, setInputVisible] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#000000");
  const [editTag, setEditTag] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);
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

  const handleEdit = (priority, index) => {
    setEditTag(index);
    setSelectedPriority(priority);
    setEditModalVisible(true);
  };

  const handleEditOk = () => {
    setEditModalVisible(false);
    setEditTag(null);
    setSelectedPriority(null);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditTag(null);
    setSelectedPriority(null);
  };

  const handleSaveEdit = async (editedTag) => {
    await updatePriority(editedTag, boardId, selectedPriority.id);
    queryClient.invalidateQueries(["priorities", boardId]);
  };

  const handleDelete = async (priorityId) => {
    await deletePriority(boardId, priorityId);
    queryClient.invalidateQueries(["columns"]);
    queryClient.invalidateQueries(["priorities"]);
  };

  const renderTag = (priority, index) => (
    <Tag key={index} color={priority.color}>
      {priority.name}
      <EditOutlined style={{ marginLeft: "8px", cursor: "pointer" }} onClick={() => handleEdit(priority, index)} />
      <Popconfirm title="Вы действительно хотите удалить метку?" onConfirm={() => handleDelete(priority.id)} okText="Да" cancelText="Нет">
        <CloseOutlined style={{ cursor: "pointer" }} />
      </Popconfirm>
    </Tag>
  );

  return (
    <Flex style={{ flexDirection: "row", flexWrap: "wrap"}}>
      {priorities?.slice(0, 3).map(renderTag)}
      {priorities && priorities.length > 3 && (
        <Popover placement="bottom" title="Дополнительные метки" content={<div>{priorities.slice(3).map(renderTag)}</div>} trigger="click">
          <Button style={{marginRight: "8px"}} size="small">+{priorities?.length-3}</Button>
        </Popover>
      )}
      {inputVisible ? (
        <Flex style={{ flexDirection: "row" }}>
          <Input
            size="small"
            style={{ width: "100px", marginRight: "8px" }}
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Название"
          />
          <input
            className="styled-input"
            type="color"
            style={{ width: "80px", marginRight: "8px", padding: "0", height: "25px" }}
            value={tagColor}
            onChange={(e) => setTagColor(e.target.value)}
          />
          <Flex style={{ gap: "8px", flexDirection: "row" }}>
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
      <Modal title="Редактирование метки" visible={editModalVisible} onCancel={handleEditCancel} footer={null}>
        <EditTagForm tag={selectedPriority} onSave={handleSaveEdit} onCancel={handleEditCancel}/>
      </Modal>
    </Flex>
  );
};

const EditTagForm = ({ tag, onSave, onCancel }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(tag);
  }, [tag, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...tag, name: values.name, color: values.color });
      form.resetFields();
    });
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Название" rules={[{ required: true, message: "Введите название" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="color" label="Цвет" rules={[{ required: true, message: "Введите цвет" }]}>
        <input type="color" className="styled-input" style={{ height: "25px", width: "80px" }} />
      </Form.Item>
      <Flex style={{ justifyContent: "flex-end", gap: "8px" }}>
        <Button type="primary" onClick={handleSave}>
          Сохранить
        </Button>
        <Button onClick={onCancel}>Отмена</Button>
      </Flex>
    </Form>
  );
};

export default TagList;
