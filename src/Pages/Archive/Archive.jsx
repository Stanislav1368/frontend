import React from "react";
import { Button, Card, Empty, Row, Col, Layout, Flex, Checkbox } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { fetchUserId, getCurrentRole, getIsArchivedTasks, getRoleByBoardId, taskChangeArchivingStatus } from "../../api";
import moment from "moment";

const Archive = ({ boardId }) => {
  const queryClient = useQueryClient();
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: isArchivedTasks, isLoading: isIsArchivedTasksLoading } = useQuery("isArchivedTasks", () => getIsArchivedTasks(userId, boardId), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
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
  if (isIsArchivedTasksLoading) {
    return <div></div>;
  }
  if (ownerLoading || currentRoleLoading) {
    return <>Loading</>;
  }
  console.log(isArchivedTasks);
  return (
    <Layout style={{ height: "100%", margin: "0px" }}>
      {isArchivedTasks.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            width: "100%",
            alignContent: "center",
          }}>
          <Empty style={{ width: "100px", height: "100px", margin: "auto" }}></Empty>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {isArchivedTasks.map((task) => (
            <Card
              bordered
              title={
                <>
                  <Checkbox className="checkbox" type="checkbox" checked={task?.isCompleted} />
                  {task?.title}
                </>
              }
              style={{
                width: "220px",
                flex: "calc(25% - 20px)",
                margin: "10px",
                maxWidth: "250px",
                transition: "background-color 0.2s, box-shadow 0.2s",
                backgroundColor: !task?.isCompleted ? "#ffffff" : "#f3f3f3", // Меняем цвет фона, чтобы выделить что задача завершена
                opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
              }}>
              <div>Столбец: {task.state.title}</div>
              <div>
                {task?.startDate && <p>Начало: {moment(task?.startDate).locale("ru").format("DD.MM.YYYY")}</p>}
                {task?.endDate && <p>Конец: {moment(task?.endDate).locale("ru").format("DD.MM.YYYY")}</p>}
              </div>
              {task?.users && task?.users.length > 0 && (
                <>
                  <Divider>Ответственные</Divider>
                  <div style={{ display: "flex" }}>
                    {task.users.map((user, index) => (
                      <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}` }}>
                        {user.firstName}
                      </Avatar>
                    ))}
                  </div>
                </>
              )}
              {(currentRole?.canAccessArchive || isOwner) && (
                <Button
                  type="primary"
                  onClick={async () => {
                    await taskChangeArchivingStatus(userId, boardId, task.stateId, task.id, false);
                    await queryClient.invalidateQueries(["isArchivedTasks"]);
                    await queryClient.invalidateQueries(["columns"]);
                  }}>
                  Восстановить
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Archive;
