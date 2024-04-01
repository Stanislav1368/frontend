import React, { useState } from "react";
import { Button, Modal, Form, Input, Checkbox, Layout, Empty } from "antd";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { createRole, fetchUserId, getCurrentRole, getRoleByBoardId, getRoles } from "../../api";
import RoleCard from "./RoleCard";
import { PlusOutlined } from "@ant-design/icons";

const Roles = () => {
  const { boardId } = useParams();
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId);
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: roles = [] } = useQuery(["roles", boardId], () => getRoles(boardId));
  const queryClient = useQueryClient();
  const createRoleMutation = useMutation((newRole) => createRole(newRole, boardId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["roles", boardId]);
    },
  });

  const handleCreateRole = async (values) => {
    await createRoleMutation.mutateAsync(values);
    setIsModalVisible(false);
  };
  const rights = [
    { title: "Создание ролей", key: "canCreateRole" },
    { title: "Управление пользователями", key: "canEditRole" },
    { title: "Доступ к архиву", key: "canAccessArchive" },
    { title: "Создание приоритетов", key: "canCreatePriorities" },
    { title: "Добавление колонок", key: "canAddColumns" },
    { title: "Добавление/перемещение задач", key: "canAddTasks" },
    { title: "Приглашение пользователей", key: "canInviteUsers" },
  ];
  return (
    <Layout>
      <div style={{ margin: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <RoleCard
          role={{
            name: "Гость",
            canCreateRole: false,
            canEditRole: false,
            canAccessArchive: false,
            canCreatePriorities: false,
            canAddColumns: false,
            canAddTasks: false,
            canInviteUsers: false,
          }}></RoleCard>
        {roles ? (
          roles
            .sort((a, b) => a - b)
            .map((role) => (
              <div key={role.id}>
                <RoleCard role={role}></RoleCard>
              </div>
            ))
        ) : (
          <Empty description={<>Пока что ролей нет</>} style={{ maxWidth: "600px", margin: "0px" }}></Empty>
        )}
        {(currentRole?.canCreateRole || isOwner) && (
          <Button
            onClick={() => setIsModalVisible(true)}
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
            <PlusOutlined style={{ fontSize: "16px", margin: "auto" }} />
          </Button>
        )}
      </div>

      <Modal title="Новая роль" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form onFinish={handleCreateRole}>
          <Form.Item name="name" label="Название роли" rules={[{ required: true, message: "Введите название роли" }]}>
            <Input />
          </Form.Item>

          {rights.map((permission) => (
            <Form.Item name={permission.key} valuePropName="checked" key={permission.key}>
              <Checkbox>{permission.title}</Checkbox>
            </Form.Item>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Закрыть
            </Button>
            <Button htmlType="submit" type="primary">
              Создать
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Roles;
