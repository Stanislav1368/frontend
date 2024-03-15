import React from "react";
import { Button, Card, Empty, Row, Col } from "antd";
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
    <div>
      {/* Add any necessary antd components */}
      <Row justify="center" gutter={[16, 16]}>
        {isArchivedTasks.length === 0 ? (
          <Empty></Empty>
        ) : (
          isArchivedTasks.map((task) => (
            <Col key={task.id}>
              <Card title={task.title} bordered={false} style={{ width: 300 }}>
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
    </div>
  );
};

export default Archive;
