import { Button, Dropdown, Flex, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import React from "react";
import { useQuery } from "react-query";
import { fetchUser } from "../../../api";
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
      <a>
        <UserOutlined /> Ваш профиль
      </a>
    ),
  },
];
const Navbar = ({ backArrow }) => {
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);

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
            margin: 0,
            letterSpacing: "3.5px",
            flex: "0 0 auto",
            lineHeight: "50px",
            textTransform: "uppercase",
            width: "130px",
            fontSize: "20px",
            fontWeight: 700,
          }}>
          Header
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
