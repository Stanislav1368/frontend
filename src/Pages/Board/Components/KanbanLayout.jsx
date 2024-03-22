import { DownOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Dropdown, Flex, Layout, Menu, Modal, Typography } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import React from "react";
import KanbanBoard from "./KanbanBoard";
import { useMutation, useQueryClient } from "react-query";
import { deleteBoard } from "../../../api";
import { MoreVert } from "@mui/icons-material";

const KanbanLayout = ({
  board,
  usersBoard,
  columns,
  updateColumns,
  userId,
  priorities,
  openAddSectionModal,
  setOpenAddSectionModal,
  openAddPriorityModal,
  setOpenAddPriorityModal,
}) => {
  const queryClient = useQueryClient();
  const DeleteBoardMutation = useMutation(() => deleteBoard(userId, board.id), {
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
    <Layout>
      <Header
        style={{
          backgroundColor: "#F5F5F5",
          display: "flex",
          padding: "0px 10px 0px 10px",
          alignItems: "center",
          height: "50px",
          justifyContent: "space-between",
        }}>
        <div style={{ alignItems: "center", display: "flex" }}>
          <Typography.Text style={{ fontSize: "24px", fontFamily: "Arial", color: "black", fontWeight: "bold" }}>{board?.title}</Typography.Text>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item danger onClick={showDeleteConfirm}>
                  Удалить доску
                </Menu.Item>
              </Menu>
            }>
            <MoreVert style={{ cursor: "pointer" }} />
          </Dropdown>
        </div>

        <Avatar.Group maxCount={2} size="large">
          {usersBoard?.map((user) => (
            <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}` }} size={36}>
              {user.firstName}
            </Avatar>
          ))}
        </Avatar.Group>
      </Header>
      <div style={{ display: "flex", padding: "0px 10px 0px 10px", gap: "5px" }}>
        <Button
          style={{ textAlign: "left", padding: "4px 10px" }}
          onClick={() => {
            setOpenAddSectionModal(true);
          }}>
          <UserOutlined /> Добавить секцию
        </Button>
        <Button
          onClick={() => {
            setOpenAddPriorityModal(true);
          }}>
          Метки
        </Button>
      </div>
      <Content>
        <div style={{ padding: 10, height: "100%" }}>
          <div style={{ height: "100%", display: "flex" }}>
            <KanbanBoard
              columns={columns}
              updateColumns={updateColumns} // Передаем функцию для обновления данных
              boardId={board?.id}
              userId={userId}
              users={usersBoard}
              priorities={priorities}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};
export default KanbanLayout;
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}
