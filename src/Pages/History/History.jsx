import React, { useState } from "react";
import { Layout, Input, Pagination, Card, Typography } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { fetchUser, fetchUserId, getNotificationsForBoard } from "../../api";
import { useParams } from "react-router-dom";
import moment from "moment";

const { Search } = Input;
const { Text } = Typography;

const History = ({}) => {
  const queryClient = useQueryClient();
  const { boardId } = useParams();
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15; // Количество элементов на странице

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

  // Фильтрация уведомлений по поисковому запросу и сортировка по убыванию времени создания
  const filteredNotifications = notifications
    ?.filter(
      (notification) =>
        notification.boardId == boardId &&
        notification.title === "Задача завершена" &&
        notification.message.toLowerCase().includes(searchValue.toLowerCase())
    )
    .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

  const paginatedNotifications = filteredNotifications?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
  };

  return (
    <Layout style={{ height: "100%", margin: "0px" }}>
      <Layout.Content>
        <Search  placeholder="Поиск по уведомлениям" allowClear onChange={(e) => setSearchValue(e.target.value)} style={{ width: "300px", padding: "12px 24px" }} />
        <div style={{ padding: "24px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          {paginatedNotifications &&
            paginatedNotifications.map((notification) => (
              <Card key={notification.id} style={{ marginBottom: "16px" }}>
                <Typography.Text>{notification.message}</Typography.Text>
                <br />
                <Text>{moment(notification.createdAt).format("DD.MM.YYYY, HH:mm:ss")}</Text>
              </Card>
            ))}
        </div>
      </Layout.Content>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredNotifications?.length || 0}
        onChange={handlePageChange}
        style={{ margin: 16, textAlign: "center" }}
      />
    </Layout>
  );
};

export default History;
