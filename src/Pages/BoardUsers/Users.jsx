import React, { useState } from "react";
import { Select, Input, Button, message, Modal, Form, Table, Layout, Avatar, Flex } from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { deleteBoard, fetchUsersByBoard, getRoles, updateRole } from "../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { OutlinedFlag } from "@mui/icons-material";

const Users = () => {
  const { boardId } = useParams();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { data: usersBoard } = useQuery(["users"], () => fetchUsersByBoard(boardId));
  const { data: roles = [] } = useQuery(["roles"], () => getRoles(boardId));
  const queryClient = useQueryClient();

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      await updateRole(userId, boardId, { roleId: newRole });
      message.success(`Роль у пользователя ${userName} успешно обновлена!`);
      queryClient.invalidateQueries(["users"]);
    } catch (error) {
      message.error("Произошла ошибка при обновлении роли пользователя.");
    }
  };

  const handleInviteUser = async (values) => {
    // Логика для добавления пользователя на доску
    try {
      // await inviteUserToBoard(boardId, values.email, values.role);
      message.success("Пользователь успешно добавлен на доску!");
      queryClient.invalidateQueries(["users"]);
      setShowAddUserModal(false);
    } catch (error) {
      message.error("Произошла ошибка при добавлении пользователя на доску.");
    }
  };

  return (
    <div style={{ margin: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {usersBoard?.map((user) => (
        <div
          key={user.id}
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid lightgray",
            display: window.innerWidth > 600 ? "flex" : "block",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "600px",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar src={user.avatar} size={64} shape="circle" />
            <h3 style={{ width: "200px", wordWrap: "break-word" }}>
              <span>{user.lastName}</span> <span>{user.firstName}</span> <span>{user.middleName}</span>
            </h3>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              style={{ width: 120 }}
              value={user.roleId}
              onChange={(value) => handleRoleChange(user.id, value, `${user.firstName} ${user.lastName}`)}>
              {roles &&
                roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.name}
                  </Select.Option>
                ))}
            </Select>
            <Button type="primary" danger>
              Удалить
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={() => setShowAddUserModal(true)}
        style={{
          color: "rgba(0, 0, 0, 0.65)", // Цвет текста сероватой прозрачности
          border: "1px solid rgba(0, 0, 0, 0.25)", // Бордюр для эффекта прозрачности
          backgroundColor: "transparent", // Прозрачный фон
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "600px",
          cursor: "pointer",
          padding: "8px 16px",
        }}>
        <PlusOutlined style={{ fontSize: "16px", margin: "auto" }} /> {/* Иконка плюса */}
      </Button>

      <Modal title="Добавить пользователя на доску" visible={showAddUserModal} onCancel={() => setShowAddUserModal(false)} footer={null}>
        <AddUserToBoard onCreate={handleInviteUser} onCancel={() => setShowAddUserModal(false)} />
      </Modal>
    </div>
  );
};

const AddUserToBoard = ({ onCreate, onCancel }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      await form.validateFields();
      onCreate(values);
    } catch (error) {
      console.error("Ошибка валидации формы:", error);
    }
  };

  return (
    <Form form={form} onFinish={handleFinish}>
      <Form.Item name="email" label="Email" rules={[{ required: true, message: "Пожалуйста, введите email" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="role" label="Роль">
        <Select>
          <Select.Option value="admin">Администратор</Select.Option>
          <Select.Option value="user">Пользователь</Select.Option>
        </Select>
      </Form.Item>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <Button style={{ marginLeft: "8px" }} onClick={onCancel}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit">
            Добавить
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Users;
