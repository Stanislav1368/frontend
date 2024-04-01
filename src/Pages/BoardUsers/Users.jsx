import React, { useState } from "react";
import { Select, Input, Button, message, Modal, Form, Table, Layout, Avatar, Flex } from "antd";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  addUserInBoard,
  createNotification,
  deleteBoard,
  deleteUserFromBoard,
  fetchUserId,
  fetchUsersByBoard,
  getCurrentRole,
  getRoleByBoardId,
  getRoles,

  updateRole,
} from "../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { OutlinedFlag } from "@mui/icons-material";

const Users = () => {
  const { boardId } = useParams();
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { data: usersBoard } = useQuery(["users"], () => fetchUsersByBoard(boardId));
  const { data: roles = [] } = useQuery(["roles"], () => getRoles(boardId));
  const queryClient = useQueryClient();
  const { data: currentRole, isLoading: currentRoleLoading } = useQuery("currentRole", () => getCurrentRole(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: isOwner, isLoading: ownerLoading } = useQuery("isOwner", () => getRoleByBoardId(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const handleRoleChange = async (userId, newRole, userName) => {
    const roleIdToUpdate = newRole === "guest" ? 0 : newRole;

    try {
      await updateRole(userId, boardId, { roleId: roleIdToUpdate });
      message.success(`Роль у пользователя ${userName} успешно обновлена!`);
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["roles"]);
    } catch (error) {
      message.error("Произошла ошибка при обновлении роли пользователя.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserFromBoard(userId, boardId);
      message.success("Пользователь удален.");
      queryClient.invalidateQueries(["users"]);
    } catch (error) {
      message.error("Произошла ошибка при удалении пользователя.");
    }
  };

  // const handleInviteUser = async (values) => {
  //   try {
  //     await addUserInBoard(values.userId, boardId); // Здесь предполагается, что values содержит userId и boardId
  //     message.success("Пользователь успешно добавлен на доску!");
  //     queryClient.invalidateQueries(["users"]);
  //     setShowAddUserModal(false);
  //   } catch (error) {
  //     message.error("Произошла ошибка при добавлении пользователя на доску.");
  //   }
  // };
  const handleSendInvite = async (values) => {
    try {
      await createNotification(values.email, boardId, "Приглашение", "Приглашение на доску"); // Здесь предполагается, что values содержит userId и boardId
      message.success("Приглашение отправлено!");
    } catch (error) {
      message.error(`Произошла ошибка при отправке приглашения.`);
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
              <span>{user.lastName}</span> <span>{user.firstName}</span> <span>{user.middleName}</span>{" "}
              {/* <span>{user.isOwner && <>isOwner</>}</span>*/}
            </h3>
          </div>
          {(isOwner && !user.isOwner) || (currentRole?.canEditRole && !user.isOwner && !user?.canEditRole && user.id !== userId) ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <Select
                style={{ width: 120 }}
                value={user.roleId || "guest"} // Устанавливаем значение по умолчанию "guest", если у пользователя нет роли
                onChange={(value) => handleRoleChange(user.id, value, `${user.firstName} ${user.lastName}`)}>
                <Select.Option key="guest" value="guest">
                  Гость
                </Select.Option>
                {roles &&
                  roles.map((role) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
              </Select>
              {/* {user.isOwner && <>isOwner</>} */}
              <Button type="primary" danger onClick={() => handleDeleteUser(user.id)}>
                Удалить
              </Button>
            </div>
          ) : (
            <>{user.isOwner ? <>Админ</> : <span>{roles.find((role) => role.id === user.roleId)?.name || "Гость"}</span>}</>
          )}
        </div>
      ))}
      {(currentRole?.canAddUser || isOwner) && (
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
      )}

      <Modal title="Добавить пользователя на доску" visible={showAddUserModal} onCancel={() => setShowAddUserModal(false)} footer={null}>
        <AddUserToBoard onCreate={handleSendInvite} onCancel={() => setShowAddUserModal(false)} />
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <Button style={{ marginLeft: "8px" }} onClick={onCancel}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit">
            Пригласить
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default Users;
