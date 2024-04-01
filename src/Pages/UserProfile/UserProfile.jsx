import { Avatar, Button, Card, Flex, Layout, List, Menu, Switch, Tabs, Typography, message, notification } from "antd";
import React, { useEffect, useState } from "react";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";
import { useQuery, useQueryClient } from "react-query";
import SocketApi, { addUserInBoard, createNotification, deleteNotification, fetchUser, getNotifications } from "../../api";
import { Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { UserOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfile = () => {
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);
  const { data: notifications, isLoading: notificationsLoading } = useQuery(["notifications"], () => getNotifications(user.id), {
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  console.log(user);
  const queryClient = useQueryClient();
  // const openNotification = (item) => {
  //   notification.open({
  //     message: item.title,
  //     description: item.description,
  //   });
  // };
  const handleInviteUser = async (_notifId, _userId, _boardId) => {
    try {
      await addUserInBoard(_userId, _boardId);
      await deleteNotification(_userId, _notifId);
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["notifications"]);
    } catch (error) {
      message.error("Произошла ошибка при добавлении пользователя на доску.");
    }
  };
  const handleDeleteInvite = async (_notifId, _userId) => {
    try {
      await deleteNotification(_userId, _notifId);
      queryClient.invalidateQueries(["notifications"]);
    } catch (error) {
      message.error("Произошла ошибка при отмене.");
    }
  };
  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("sendInvite", async (userId) => {
      queryClient.invalidateQueries(["notifications"]);
    });

    return () => {};
  }, []);
  if (isUserLoading || notificationsLoading) {
    return (
      <>
        <Layout style={{ height: "100vh" }}>
          <Navbar backArrow={false} />

          <Layout>Loading</Layout>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={true} />
        <Content style={{ padding: "0 5%", maxWidth: "1200px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ minWidth: "64px", minHeight: "64px" }} />
              <div style={{ marginLeft: "20px" }}>
                <h2>{user.name}</h2>
                <p>
                  <strong>Электронная почта:</strong> {user.email}
                </p>
                <p>
                  <strong>ФИО:</strong> <span>{user.lastName} </span>
                  <span>{user.firstName} </span>
                  <span>{user.middleName} </span>
                </p>
              </div>
            </div>
            <List
              bordered
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.title} description={item.message} />
                  <Flex style={{ justifyContent: "space-between" }}>
                    <Button
                      type="text"
                      style={{ color: "green", borderColor: "green" }}
                      onClick={() => handleInviteUser(item.id, item.userId, item.boardId)}>
                      Принять
                    </Button>
                    <Button style={{ marginLeft: "10px" }} danger onClick={() => handleDeleteInvite(item.id, item.userId)}>
                      Отмена
                    </Button>
                  </Flex>

                  {/* <p style={{ color: "#999" }}>{item.date}</p> */}
                </List.Item>
              )}
            />
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default UserProfile;
