import React, { useEffect } from "react";
import { Layout, Typography, List } from "antd";
import { useQuery, useQueryClient } from "react-query";
import SocketApi, {
  createNotification,
  createNotificationForBoard,
  fetchUser,
  fetchUserId,
  getNotifications,
  getNotificationsForBoard,
} from "../../api";
import { useParams } from "react-router-dom";
import moment from "moment";
const History = ({}) => {
  const queryClient = useQueryClient();
  const { boardId } = useParams();
  console.log(boardId);

  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery(
    ["notificationsForBoard"],
    () => getNotificationsForBoard(user.id, boardId),
    {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );
  console.log(notifications);

  const filteredNotifications = notifications?.filter((notification) => notification.boardId == boardId && notification.title === "Задача завершена");
  console.log(filteredNotifications);
  return (
    <Layout style={{ height: "100%", margin: "0px" }}>
      <Layout.Content>
        <div style={{ padding: 24 }}>
          <Typography.Title level={2}>History</Typography.Title>
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
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default History;
