import React, { useEffect, useState } from "react";

import { useQuery, useQueryClient } from "react-query";
import SocketApi, { commentTask, getCommentsTask } from "../api";
import { Avatar, Button, Form, Input, List, Divider } from "antd";

const Comments = ({ userId, boardId, stateId, taskId, currentRole }) => {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery(["comments", taskId], () => getCommentsTask(userId, boardId, stateId, taskId), {
    enabled: !!taskId,
  });

  if (!isLoading) {
  }
  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("newComment", () => {
      queryClient.invalidateQueries(["comments", taskId]);
    });
    return () => {
      SocketApi.socket.off("deleteComment");
    };
  }, []);
  return (
    <>
      <Divider orientation="left">Комментарии</Divider>
      <List
        dataSource={comments}
        loading={isLoading}
        itemLayout="horizontal"
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar key={item.user.id} style={{ backgroundColor: `${stringToColor(item.user.firstName)}` }} size={36}>
                  {item.user.firstName}
                </Avatar>
              }
              title={<a>{item.user.firstName}</a>}
              description={item.comment}
            />
          </List.Item>
        )}
      />
      <FormComment userId={userId} boardId={boardId} stateId={stateId} taskId={taskId} currentRole={currentRole}></FormComment>
    </>
  );
};

export default Comments;

const FormComment = ({ userId, boardId, stateId, taskId, currentRole }) => {
  const [form] = Form.useForm();
  const [charCountWarning, setCharCountWarning] = useState(false);

  const handleCommentSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.comment.length > 255) {
        message.error("Комментарий не должен превышать 255 символов");
        return;
      }
      await commentTask({ comment: values.comment }, userId, boardId, stateId, taskId);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value.length > 255) {
      setCharCountWarning(true);
    } else {
      setCharCountWarning(false);
    }
  };

  return (
    <Form form={form} onFinish={handleCommentSubmit}>
      <Form.Item name="comment" rules={[{ required: true, message: "Введите ваш комментарий" }]}>
        <Input.TextArea placeholder="Введите ваш комментарий" onChange={handleInputChange} />
      </Form.Item>
      {charCountWarning && <p style={{ color: "red" }}>Превышено допустимое количество символов (255)</p>}
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{backgroundColor: "#519839"}}>
          Добавить комментарий
        </Button>
      </Form.Item>
    </Form>
  );
};
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
