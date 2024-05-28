import { CheckOutlined, DownOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Divider, Dropdown, Flex, Layout, Menu, Modal, Typography, message, List, Select, Input, Tag } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import React, { useEffect, useRef, useState } from "react";
import KanbanBoard from "./KanbanBoard";
import { useMutation, useQuery, useQueryClient } from "react-query";
import SocketApi, { deleteBoard, deleteUserFromBoard, getCurrentRole, getNotificationsForBoard, getRoleByBoardId, updateBoard } from "../../../api";
import { MoreVert, NotificationsOutlined } from "@mui/icons-material";
import moment from "moment";
import TagList from "./TagList";

const KanbanLayout = ({
  board,
  boardId,
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
  if (!board) {
    return "";
  }
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(board.title);
  const handleSave = async () => {
    await updateBoard(userId, boardId, { title: editedTitle });
    queryClient.invalidateQueries("board");
    setIsEditing(false);
  };
  const DeleteBoardMutation = useMutation(() => deleteBoard(userId, board.id), {
    onSuccess: () => {
      queryClient.invalidateQueries("boards");
      window.location.href = "/boards";
    },
  });

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
  const { data: notifications, isLoading: notificationsLoading } = useQuery(["notifications"], () => getNotificationsForBoard(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  useEffect(() => {
    SocketApi.socket.on("sendNotif", async () => {
      queryClient.invalidateQueries(["notifications"]);
    });

    return () => {};
  }, []);
  const titleInputRef = useRef(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const handleUserFilterChange = (selectedUserIds) => {
    setSelectedUsers(selectedUserIds);
  };

  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const handlePriorityFilterChange = (selectedPriorityIds) => {
    setSelectedPriorities(selectedPriorityIds);
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Вы уверены, что хотите удалить доску?",
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      content: "Это действие нельзя отменить.",
      onOk: () => DeleteBoardMutation.mutate(),
    });
  };
  const handleFocusChange = (focused) => {
    if (!focused && isEditing) {
      handleSave();
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserFromBoard(userId, boardId);
      window.location.href = "/boards";
      queryClient.invalidateQueries(["users"]);
    } catch (error) {
      message.error("Произошла ошибка при выходе.");
    }
  };
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  if (currentRole === undefined) {
    return <></>;
  }

  const filteredNotifications = notifications?.filter((notification) => notification.boardId == boardId && notification.title === "Задача завершена");

  const menu = (
    <Menu>
      <List
        dataSource={filteredNotifications}
        renderItem={(notification) => (
          <List.Item key={notification.id}>
            <Typography.Text>{notification.message}</Typography.Text>
            <br />
            <Typography.Text>{moment(notification.createdAt).format("DD.MM.YYYY, HH:mm:ss")}</Typography.Text>
          </List.Item>
        )}
      />
    </Menu>
  );

  return (
    <Layout style={{ height: "100%" }}>
      <Header
        style={{
          backgroundColor: "#F5F5F5",
          display: "flex",
          padding: "0px 10px 0px 10px",
          alignItems: "center",
          height: "50px",
          justifyContent: "space-between",
          flexWrap: "wrap", // Добавлено для поддержки адаптивности
        }}>
        {/* Левая часть заголовка */}
        <div style={{ alignItems: "center", display: "flex", flexBasis: "50%", minWidth: "50%" }}>
          {isEditing ? (
            <Flex style={{ alignItems: "center", gap: "5px", flexBasis: "50%", minWidth: "50%" }}>
              <Input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{ width: "100%" }} // Использовано значение ширины в процентах для адаптивности
                onBlur={() => handleFocusChange(false)}
              />
              <Button onClick={handleSave}>
                <CheckOutlined />
              </Button>
            </Flex>
          ) : (
            <div style={{ alignItems: "center", display: "flex", flexBasis: "100%", minWidth: "100%" }}>
              <Typography.Text
                style={{
                  fontSize: "24px",
                  fontFamily: "Arial",
                  color: "black",
                  fontWeight: "bold",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                onClick={() => setIsEditing(true)}>
                {board?.title}
              </Typography.Text>
              <Dropdown
                overlay={
                  <Menu>
                    {isOwner && (
                      <Menu.Item danger onClick={showDeleteConfirm}>
                        Удалить доску
                      </Menu.Item>
                    )}
                    <Menu.Item danger onClick={() => handleDeleteUser(userId)}>
                      Покинуть доску
                    </Menu.Item>
                  </Menu>
                }>
                <MoreVert style={{ cursor: "pointer" }} />
              </Dropdown>
            </div>
          )}
        </div>

        {/* Правая часть заголовка */}
        <div style={{ flexBasis: "50%", minWidth: "50%" }}>
          <Flex style={{ alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
            <Avatar.Group maxCount={2} size="large">
              {usersBoard?.map((user) => (
                <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}` }} size="large">
                  {user.firstName}
                </Avatar>
              ))}
            </Avatar.Group>
          </Flex>
        </div>
      </Header>

      <div style={{ display: "flex", padding: "0px 10px 5px 10px", gap: "5px", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Flex style={{ gap: "5px", alignItems: "center", flex: "1", justifyContent: "space-between", flexWrap: "wrap" }}>
          <Flex style={{ gap: "8px" }}>
            {(currentRole?.name === "Администратор" || isOwner) && (
              <Button
                size="small"
                onClick={() => {
                  setOpenAddSectionModal(true);
                }}>
                <UserOutlined /> Добавить секцию
              </Button>
            )}
            {(currentRole?.name === "Редактор" || isOwner || currentRole?.name === "Администратор") && <TagList boardId={boardId}></TagList>}
          </Flex>

          <Flex style={{ gap: "8px" }}>
            <div style={{ flexBasis: "45%", minWidth: "200px", maxWidth: "300px" }}>
              <Select size="small" mode="multiple" style={{ minWidth: "100%" }} placeholder="Фильтр по пользователям" onChange={handleUserFilterChange}>
                {usersBoard?.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.firstName}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ flexBasis: "45%", minWidth: "200px", maxWidth: "300px" }}>
              <Select size="small" mode="multiple" style={{ width: "100%" }} placeholder="Фильтр по метке" onChange={handlePriorityFilterChange}>
                {priorities?.map((priority) => (
                  <Select.Option key={priority.id} value={priority.id}>
                    {priority.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Flex>
        </Flex>
      </div>
      <Divider style={{ margin: "0px 0px" }}></Divider>
      <Content style={{ padding: 10, overflowY: "auto", height: "100%" }}>
        <KanbanBoard
          columns={columns?.map((column) => ({
            ...column,
            tasks:
              selectedUsers.length > 0
                ? column?.tasks
                    ?.filter((task) => task.users.some((taskUser) => selectedUsers.includes(taskUser.id)))
                    .filter((task) => selectedPriorities.length === 0 || selectedPriorities.includes(task.priorityId))
                : column?.tasks?.filter((task) => selectedPriorities.length === 0 || selectedPriorities.includes(task.priorityId)),
          }))}
          updateColumns={updateColumns}
          boardId={board?.id}
          userId={userId}
          users={usersBoard}
          priorities={priorities}
          selectedUsers={selectedUsers}
          selectedPriorities={selectedPriorities}
        />
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
