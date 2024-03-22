import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Checkbox, Layout, Drawer, Empty } from "antd";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { createRole, getRoles } from "../../api";
import RoleCard from "./RoleCard";
import { PlusOutlined } from "@ant-design/icons";

const Roles = () => {
  const { boardId } = useParams();
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

  return (
    <Layout>
      <div style={{ margin: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {roles ? (
          roles?.map((role) => (
            <div key={role.id}>
              <RoleCard role={role}></RoleCard>
            </div>
          ))
        ) : (
          <Empty description={<>Пока что ролей нет</>} style={{ maxWidth: "600px", margin: "0px" }}></Empty>
        )}

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
          <PlusOutlined style={{ fontSize: "16px", margin: "auto" }} /> {/* Иконка плюса */}
        </Button>
      </div>

      <Modal title="Create New Role" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form onFinish={handleCreateRole}>
          <Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Please enter role name" }]}>
            <Input />
          </Form.Item>

          <h4>Permissions:</h4>

          {[
            { russian: "Возможность редактировать информацию доски", english: "can Edit Board Info" },
            { russian: "Возможность добавлять колонки", english: "can Add Columns" },
            { russian: "Возможность добавлять пользователей", english: "can Add Users" },
            { russian: "Возможность добавлять приоритеты", english: "can Add Priorities" },
            { russian: "Возможность создавать роли", english: "can Create Roles" },
            { russian: "Доступ к статистике", english: "can Access Statistics" },
            { russian: "Создание отчетов", english: "can Create Reports" },
            { russian: "Доступ к архиву", english: "can Access Archive" },
          ].map((permission) => (
            <Form.Item name={permission.english.replace(/\s/g, "")} valuePropName="checked" key={permission.english}>
              <Checkbox>{permission.russian}</Checkbox>
            </Form.Item>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button htmlType="submit" type="primary">
              Create
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Roles;
