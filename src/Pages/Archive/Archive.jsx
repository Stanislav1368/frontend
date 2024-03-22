import React from "react";
import { Button, Card, Empty, Row, Col, Layout } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { fetchUserId, getIsArchivedTasks, taskChangeArchivingStatus } from "../../api";

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

  if (isIsArchivedTasksLoading) {
    return <div></div>;
  }

  return (
    <Layout style={{ height: "100%", margin: "0px" }}>
      <Row style={{ margin: "0px", gap: "10px", height: "100%", width: "100%", padding: "0px" }} gutter={16}>
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
          isArchivedTasks.map((task) => (
            <Col span={5} key={task.id} style={{ padding: "0px" }}>
              <Card title={task.title} bordered={false}>
                <p>{task.description}</p>
                <Button
                  type="primary"
                  onClick={async () => {
                    await taskChangeArchivingStatus(userId, boardId, task.stateId, task.id, false);
                    await queryClient.invalidateQueries(["isArchivedTasks"]);
                    await queryClient.invalidateQueries(["columns"]);
                  }}>
                  Восстановить
                </Button>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Layout>
  );
};

export default Archive;
