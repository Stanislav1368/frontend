import React, { useState } from "react";
import { Select, Input, Button, Modal, Form } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons"; // Импортируем иконку для подтверждения удаления
import { deleteBoard } from "../../api";
import { useMutation, useQueryClient } from "react-query";

const BoardSettings = ({ boardId, userId }) => {
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Добавляем состояние для модального окна удаления
  const queryClient = useQueryClient();
  const handleAddUser = (values) => {
    console.log("Добавить пользователя:", values);
  };

  const DeleteBoardMutation = useMutation(() => deleteBoard(userId, boardId), {
    onSuccess: () => {
      queryClient.invalidateQueries("boards");
      window.location.href = "/boards";
    },
  });

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Вы уверены, что хотите удалить доску?",
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      content: "Это действие нельзя отменить.",
      onOk: () => DeleteBoardMutation.mutate(),
    });
  };

  return (
    <div>
      <Button onClick={() => setAddUserModalVisible(true)}>Добавить пользователя на доску</Button>
      <Button>Управление ролями</Button>
      <Button danger onClick={showDeleteConfirm}>
        Удалить доску
      </Button>

      <Modal title="Добавить пользователя на доску" visible={addUserModalVisible} onCancel={() => setAddUserModalVisible(false)} footer={null}>
        <AddUserToBoard onCreate={handleAddUser} onCancel={() => setAddUserModalVisible(false)} />
      </Modal>
    </div>
  );
};

const AddUserToBoard = ({ onCreate, onCancel }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onCreate}>
      <Form.Item name="email" label="Email" rules={[{ required: true, message: "Пожалуйста, введите email" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="role" label="Роль">
        <Select>
          <Select.Option value="admin">Администратор</Select.Option>
          <Select.Option value="user">Пользователь</Select.Option>
        </Select>
      </Form.Item>
      <Button htmlType="submit">Добавить</Button>
      <Button onClick={onCancel}>Отмена</Button>
    </Form>
  );
};

export default BoardSettings;
