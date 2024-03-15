import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Checkbox, Layout } from "antd";
import { createRole, getRoles } from "../../api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { CheckBox } from "@mui/icons-material";

const Roles = ({ boardId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: roles = [] } = useQuery(["roles", boardId], () => getRoles(boardId));
  const queryClient = useQueryClient();
  const createRoleMutation = useMutation((newRole) => createRole(newRole, boardId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["roles", boardId]);
    },
  });

  const columns = [
    { title: "Role Name", dataIndex: "name", key: "name" },
    // Можешь дополнить колонки по своему усмотрению
  ];

  const handleCreateRole = async (values) => {
    await createRoleMutation.mutateAsync(values);
    setIsModalVisible(false);
  };

  return (
    <Layout>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Create New Role
      </Button>
      <Table dataSource={roles} columns={columns} />

      <Modal title="Create New Role" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form onFinish={handleCreateRole}>
          <Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Please enter role name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="canEditBoardInfo" label="Can Edit Board Info" valuePropName="checked">
            <Checkbox>Can Edit Board Info</Checkbox>
          </Form.Item>
          <Form.Item name="canAddColumns" label="Can Add Columns" valuePropName="checked">
            <Checkbox>Can Add Columns</Checkbox>
          </Form.Item>
          <Form.Item name="canAddUsers" label="Can Add Users" valuePropName="checked">
            <Checkbox>Can Add Users</Checkbox>
          </Form.Item>
          <Form.Item name="canAddPriorities" label="Can Add Priorities" valuePropName="checked">
            <Checkbox>Can Add Priorities</Checkbox>
          </Form.Item>
          <Form.Item name="canCreateRoles" label="Can Create Roles" valuePropName="checked">
            <Checkbox>Can Create Roles</Checkbox>
          </Form.Item>
          <Form.Item name="canAccessStatistics" label="Can Access Statistics" valuePropName="checked">
            <Checkbox>Can Access Statistics</Checkbox>
          </Form.Item>
          <Form.Item name="canCreateReports" label="Can Create Reports" valuePropName="checked">
            <Checkbox>Can Create Reports</Checkbox>
          </Form.Item>
          <Form.Item name="canAccessArchive" label="Can Access Archive" valuePropName="checked">
            <Checkbox>Can Access Archive</Checkbox>
          </Form.Item>

      
          <Button htmlType="submit" type="primary">
            Create
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Roles;
