import { Avatar, Badge, Dropdown, Flex, notification, Menu, List } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import SocketApi, { deleteNotification, fetchUser, getInvitations, getNotificationsForUser, markNotificationsAsRead } from "../../../api";
import "./Navbar.css";
import { ArrowBack } from "@mui/icons-material";
import { LogoutOutlined, UserOutlined, BellOutlined, DeleteOutlined } from "@ant-design/icons";
import { Icon } from "@mui/material";
import kanbanImage from "../../../../kanban.png"; // Импортируем изображение

const handleLogoutClick = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const items = [
  {
    key: "1",
    label: (
      <a onClick={handleLogoutClick}>
        <LogoutOutlined /> Выйти из системы
      </a>
    ),
  },
  {
    key: "2",
    label: (
      <a onClick={() => (window.location.href = "/profile")}>
        <UserOutlined /> Ваш профиль
      </a>
    ),
  },
];

const Navbar = ({ backArrow }) => {
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);

  const { data: invitations, isLoading: invitationsLoading } = useQuery(["invitations"], () => getInvitations(user.id), {
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery(["notificationsForUser"], () => getNotificationsForUser(user.id), {
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const filteredNotifications = notifications?.filter(
    (notification) => notification.userId === user.id && notification.title === "Назначение на задачу"
  );
  const unreadNotifications = filteredNotifications?.filter((notification) => !notification.isRead);
  const queryClient = useQueryClient();

  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("sendInvite", async (userId, title, message) => {
      if (user?.id == userId) {
        notification.open({
          message: title,
          description: message,
          style: { cursor: 'pointer' },
          onClick: () => {
            window.location.href = "profile";
          },
        });

        queryClient.invalidateQueries(["invitations"]);
      }
    });
    SocketApi.socket.on("sendNotif", async () => {
      queryClient.invalidateQueries(["notificationsForUser"]);
    });
    return () => {};
  }, [notifications]);

  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("sendNotif", async () => {
      queryClient.invalidateQueries("notificationsForUser");
    });

    return () => {};
  }, []);

  const menu = (
    <Menu style={{ width: 400 }}>
      {filteredNotifications
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((notification) => (
          <Menu.Item style={{ cursor: "default" }} key={notification.id} onClick={(e) => e.stopPropagation()}>
            <Flex style={{ alignItems: "center", justifyContent: "space-between" }}>
              <span>
                Вы назначены на задачу {notification?.task?.title} на доске{" "}
                <a href={`/boards/${notification?.board?.id}`}>{notification?.board?.title}</a>
              </span>
              <DeleteOutlined
                onClick={() => {
                  deleteNotification(user?.id, notification?.id);
                  queryClient.invalidateQueries("notificationsForUser");
                }}
                className="actionFile"
                style={{ cursor: "pointer", padding: "5px", borderRadius: "5px", fontSize: "20px", color: "#ff4d4f" }}
              />
            </Flex>
          </Menu.Item>
        ))}
    </Menu>
  );

  const markAllNotificationsAsRead = async () => {
    const allNotificationIds = filteredNotifications.map((notification) => notification.id);
    markNotificationsAsRead(user.id, allNotificationIds);
    await queryClient.invalidateQueries(["notificationsForUser"]);
  };

  return (
    <Header
      style={{
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-between",
        padding: "0px 0px 0px 10px",
        alignItems: "center",
        height: "50px",
      }}>
      <Flex style={{ alignItems: "center", gap: "5px" }}>
        {backArrow ? (
          <ArrowBack
            style={{ cursor: "pointer" }}
            onClick={() => {
              window.location.href = "/boards";
            }}></ArrowBack>
        ) : null}

        {/* Условный рендер для скрытия названия "KANBAN" при маленькой ширине экрана */}
        {window.innerWidth > 768 && (
          <h1
            style={{
              margin: "0px",
              letterSpacing: "3.5px",
              flex: "0 0 auto",
              lineHeight: "50px",
              textTransform: "uppercase",
              width: "130px",
              fontSize: "20px",
              fontWeight: 700,
            }}>
            <span> KANBAN</span>
          </h1>
        )}
      </Flex>

      <Flex style={{ height: "100%" }}>
        <Dropdown overlay={menu} trigger={["click"]} onClick={() => markAllNotificationsAsRead()}>
          <button className="profile-btn">
            <Badge count={unreadNotifications ? unreadNotifications.length : 0}>
              <Avatar size={32} icon={<BellOutlined />} />
            </Badge>
          </button>
        </Dropdown>


        <Dropdown menu={{ items }}>
          <button style={{ minWidth: "125px" }} className="profile-btn">
            <Badge count={invitations ? invitations.length : 0}>
              <Avatar size={32} icon={<UserOutlined />} />
            </Badge>
            <span style={{ marginLeft: "10px" }}>
              {/* Сокращение имени пользователя */}
              {window.innerWidth > 768 ? `${user?.firstName} ${user?.lastName}` : `${user?.firstName?.charAt(0)}. ${user?.lastName}`}
            </span>
          </button>
        </Dropdown>
      </Flex>
    </Header>
  );
};

export default Navbar;
