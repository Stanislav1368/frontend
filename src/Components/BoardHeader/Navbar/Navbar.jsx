import { Button, Dropdown, Flex, Typography, notification } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import SocketApi, { fetchUser } from "../../../api";
import "./Navbar.css";
import { ArrowBack } from "@mui/icons-material";
import { LogoutOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";

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

  const queryClient = useQueryClient();
  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("sendInvite", async (userId) => {
      console.log(user.id == userId);
      if (user?.id === userId) {

        notification.open({
          message: "Приглашение",
          description: "Приглашение на доску",
        });
        queryClient.invalidateQueries(["notifications"]);
      }
    });

    return () => {};
  }, []);
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
          KANBAN
        </h1>
      </Flex>

      <Flex style={{ height: "100%" }}>
        <Dropdown menu={{ items }}>
          <button className="profile-btn">
            {user?.firstName} {user?.lastName}
          </button>
        </Dropdown>
      </Flex>
    </Header>
  );
};

export default Navbar;
