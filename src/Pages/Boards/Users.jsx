import React, { useState } from "react";
import { Select, Input, Button, Modal, Form, Table, Layout } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons"; // Импортируем иконку для подтверждения удаления
import { deleteBoard, getRoles, updateRole } from "../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";

const Users = ({ boardId, userId, usersBoard }) => {
  const [updatedUserRoles, setUpdatedUserRoles] = useState({});
  const { data: roles = [] } = useQuery(["roles", boardId], () => getRoles(boardId));
  console.log(roles);
  const columns = [
    {
      title: "User Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text, record) => (
        <>
          {console.log(text.roleId === record.roleId ? record.roleId : undefined)}
          <Select
            style={{ width: 120 }}
            defaultValue={text.roleId === record.roleId ? record.roleId : undefined}
            onChange={(value) => handleRoleChange(record.id, value)}>
            {roles &&
              roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
          </Select>
        </>
      ),
    },
  ];

  const handleRoleChange = (userId, newRole) => {
    setUpdatedUserRoles({ ...updatedUserRoles, [userId]: newRole });
  };

  const handleUpdateRoles = async () => {
    for (const userId in updatedUserRoles) {
      await updateRole(userId, boardId, { roleId: updatedUserRoles[userId] });
    }
    // Можно добавить логику обновления данных на фронтенде после изменения ролей
  };
  console.log(usersBoard);
  return (
    <div>
      <Table
        dataSource={usersBoard.map((user) => ({ ...user, role: { roleId: user.roleId } }))} // Отображаем текущую роль пользователя как объект
        columns={columns}
      />

      <Button type="primary" onClick={handleUpdateRoles}>
        Update Roles
      </Button>
    </div>
  );
};

const AddUserToBoard = ({ onCreate, onCancel }) => {
  const [form] = Form.useForm();

  return (
    <Layout>
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
    </Layout>
  );
};

export default Users;
