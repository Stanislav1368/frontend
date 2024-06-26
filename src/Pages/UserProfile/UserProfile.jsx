import { Alert, Avatar, Button, Layout, List, Space, Spin, Tabs, Typography, message } from "antd";
import React, { useEffect } from "react";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";
import { useQuery, useQueryClient } from "react-query";
import SocketApi, {
  addUserInBoard,
  deleteInvitations,
  fetchUser,
  getInvitations,
  getNotificationsForBoard,
  getNotificationsForUser,
} from "../../api";
import { UserOutlined } from "@ant-design/icons";
import moment from "moment";

const { Content } = Layout;
const { TabPane } = Tabs;

const UserProfile = () => {
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);
  const { data: invitations, isLoading: invitationsLoading } = useQuery(["invitations"], () => getInvitations(user.id), {
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const queryClient = useQueryClient();
  const { data: notifications, isLoading: notificationsLoading } = useQuery(["notificationsForBoard"], () => getNotificationsForUser(user.id), {
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const filteredNotifications = notifications?.filter((notification) => notification.title === "Назначение на задачу");

  const handleInviteUser = async (_notifId, _userId, _boardId) => {
    try {
      await addUserInBoard(_userId, _boardId);
      await deleteInvitations(_userId, _notifId);
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["invitations"]);
    } catch (error) {
      message.error("Произошла ошибка при добавлении пользователя на доску.");
    }
  };
  const handleDeleteInvite = async (_notifId, _userId) => {
    try {
      await deleteInvitations(_userId, _notifId);
      queryClient.invalidateQueries(["invitations"]);
    } catch (error) {
      message.error("Произошла ошибка при отмене.");
    }
  };
  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("sendInvite", async () => {
      queryClient.invalidateQueries(["invitations"]);
    });

    return () => {};
  }, []);
  if (isUserLoading || invitationsLoading) {
    return (
      <>
        <Layout style={{ height: "100vh" }}>
          <Navbar backArrow={false} />

          <Layout style={{ justifyContent: "center", alignItems: "center" }}>
            <Spin size="large" />
          </Layout>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={true} user={user} />
        <Content style={{ padding: "0 5%", maxWidth: "1200px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}`, fontSize: "12px" }} size={64}>
                {user.firstName}
              </Avatar>
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
              dataSource={invitations}
              renderItem={(item) => (
                <div style={{ marginBottom: "10px" }}>
                  {console.log(invitations)}
                  <Alert
                    message={item.title}
                    description={`${item.message} от пользователя ${item.inviterLastName} ${item.inviterFirstName}  ${item.inviterMiddleName}. Дата приглашения: ${moment(item.createdAt).locale("ru").format("DD.MM.YYYY, h:m")}`}
                    type="info"
                    action={
                      <Space direction="vertical">
                        <Button
                          type="text"
                          style={{ color: "green", borderColor: "green", width: "90px" }}
                          onClick={() => handleInviteUser(item.id, item.userId, item.boardId)}>
                          Принять
                        </Button>
                        <Button style={{ width: "90px" }} danger onClick={() => handleDeleteInvite(item.id, item.userId)}>
                          Отмена
                        </Button>
                      </Space>
                    }
                  />
                </div>
                // <List.Item>
                //   <List.Item.Meta title={item.title} description={item.message} />
                //   <Flex style={{ justifyContent: "space-between" }}>
                // <Button
                //   type="text"
                //   style={{ color: "green", borderColor: "green" }}
                //   onClick={() => handleInviteUser(item.id, item.userId, item.boardId)}>
                //   Принять
                // </Button>
                // <Button style={{ marginLeft: "10px" }} danger onClick={() => handleDeleteInvite(item.id, item.userId)}>
                //   Отмена
                // </Button>
                //   </Flex>

                //   {/* <p style={{ color: "#999" }}>{item.date}</p> */}
                // </List.Item>
              )}
            />
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default UserProfile;
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
