import React, { useState } from "react";
import { Select, Input, Button, message, Modal, Form, Avatar } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  createInvitation,
  deleteUserFromBoard,
  fetchUser,
  fetchUserId,
  fetchUsersByBoard,
  getCurrentRole,
  getRoleByBoardId,
  getRoles,
  updateRole,
} from "../../api";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

const Users = () => {
  const { boardId } = useParams();
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId);
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser, {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { data: usersBoard, loading: usersBoardLoading } = useQuery(["users"], () => fetchUsersByBoard(boardId));
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
    if (values.email === user.email) {
      message.error("Нельзя отправить приглашение самому себе!");
      return;
    } else {
      await createInvitation(values.email, userId, boardId, "Приглашение", "Приглашение на доску"); // Здесь предполагается, что values содержит userId и boardId
      message.success("Приглашение отправлено!");
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
              <span>{user.lastName}</span> <span>{user.firstName}</span> <span>{user.middleName}</span> {user.isOwner && <span>Владелец</span>}
            </h3>
          </div>
          {console.log(user)}
          {isOwner || (currentRole?.name === "Администратор" && !user.isOwner && user.roleName !== "Владелец") ? (
            <div style={{ display: "flex", gap: "10px" }}>
              {currentRole?.name === "Администратор" && user.roleName === "Администратор" ? (
                <span>{roles.find((role) => role.id === user.roleId)?.name}</span>
              ) : user.isOwner ? (
                <span>Владелец</span>
              ) : (
                <Select
                  style={{ width: 120 }}
                  value={user.roleId}
                  onChange={(value) => handleRoleChange(user.id, value, `${user.firstName} ${user.lastName}`)}
                  disabled={user.id === userId || (currentRole?.name === "Администратор" && user.isOwner)}>
                  {roles &&
                    roles.map((role) => {
                      if (currentRole?.name === "Администратор") {
                        if (role.name === "Редактор" || role.name === "Читатель") {
                          return (
                            <Select.Option key={role.id} value={role.id}>
                              {role.name}
                            </Select.Option>
                          );
                        }
                      } else if (user.isOwner) {
                        if (role.name !== "Администратор") {
                          return (
                            <Select.Option key={role.id} value={role.id}>
                              {role.name}
                            </Select.Option>
                          );
                        }
                      } else {
                        return (
                          <Select.Option key={role.id} value={role.id}>
                            {role.name}
                          </Select.Option>
                        );
                      }
                    })}
                </Select>
              )}
              {(isOwner || (currentRole?.name === "Администратор" && user.roleName !== "Администратор" && user.roleName !== "Владелец")) &&
                !user.isOwner && (
                  <Button type="primary" danger onClick={() => handleDeleteUser(user.id)}>
                    Удалить
                  </Button>
                )}
            </div>
          ) : (
            <span>{user.isOwner ? "Владелец" : roles.find((role) => role.id === user.roleId)?.name}</span>
          )}
        </div>
      ))}

      {(currentRole?.name === "Администратор" || isOwner) && (
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
