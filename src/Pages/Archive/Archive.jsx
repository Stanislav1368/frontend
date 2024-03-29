import React from "react";
import { Button, Card, Empty, Row, Col, Layout, Flex } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { fetchUserId, getCurrentRole, getIsArchivedTasks, getRoleByBoardId, taskChangeArchivingStatus } from "../../api";

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
              title={
                <Flex style={{ justifyContent: "space-between" }}>
                  {task.title}
                  {(currentRole?.canCreateRole || isOwner) && (
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
                </Flex>
              }
              bordered={false}
              style={{
                flex: "0 0 calc(25% - 20px)",
                margin: "10px",
                minWidth: "220px",
              }}>
              <span>{task.description}</span>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Archive;
