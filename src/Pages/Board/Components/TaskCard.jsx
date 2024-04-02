import { CalendarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Archive, ArchiveOutlined, Delete, DeleteOutline, DeleteOutlineOutlined } from "@mui/icons-material";
import { Avatar, Badge, Button, Card, Checkbox, DatePicker, Descriptions, Divider, Drawer, Flex, Form, Input, List, Modal, Tag } from "antd";
import moment from "moment";
import React, { useState } from "react";
import Comments from "../../../Components/Comments";
import { getRoleByBoardId, taskChangeArchivingStatus, updateTask, updateTaskIsCompleted } from "../../../api";
import { useQuery, useQueryClient } from "react-query";
import dayjs from "dayjs";

const TaskCard = ({ task, isDragging, deleteTask, userId, boardId }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const [userIds, setUserIds] = useState(task?.userIds || []);
  const [priorityId, setPriorityId] = useState(task.priorityId);
 
  const [startDate, setStartDate] = useState(task.startDate);
  const [endDate, setEndDate] = useState(task.endDate);
  const [test, setTest] = useState("Test");

  const handleUpdateTask = async (values) => {
  
    try {
      await updateTask(userId, boardId, task.stateId, task.id, values);
      queryClient.invalidateQueries(["columns"]);
      form.resetFields(); // Сбросить значения полей формы
    } catch (error) {
      console.error("Ошибка при обновлении задачи", error);
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Вы уверены, что хотите удалить задачу?",
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      content: "Это действие нельзя отменить.",
      onOk: () => deleteTask(task?.stateId, task?.id),
      cancelText: "Отмена",
    });
  };
  const showUpdateConfirm = () => {
    Modal.confirm({
      title: "Изменение задачи",
      content: (
        <Form form={form} onFinish={handleUpdateTask} initialValues={task}>
          <Form.Item name="title" rules={[{ required: true, message: "Пожалуйста, введите название задачи" }]}>
            <Input placeholder="Название задачи" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Описание задачи" />
          </Form.Item>
          <Form.Item name="dates">
            <DatePicker.RangePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      ),
      onOk: () => form.submit(),
      cancelText: "Отмена",
    });
  };
  const { data: isOwner, isLoading: ownerLoading } = useQuery("isOwner", () => getRoleByBoardId(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const handleArchiveTask = async (userId, boardId, columnId, taskId) => {
    await taskChangeArchivingStatus(userId, boardId, columnId, taskId, true);

    queryClient.invalidateQueries(["columns"]);
  };
  const handleTaskCompletion = () => {
    const updatedIsCompleted = !task.isCompleted;
    updateTaskIsCompleted(userId, boardId, task?.stateId, task.id, { isCompleted: updatedIsCompleted }).then(() => {
      queryClient.invalidateQueries(["columns"]);
    });
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      {task?.priority ? ( // Проверяем наличие приоритета у задачи
        <Badge.Ribbon
          text={`${task?.priority?.name}`}
          color={`${task?.priority?.color}`}
          style={{
            opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
          }}>
          <Card
            title={
              <>
                {(isOwner || task.users.some((user) => user.id === userId)) && (
                  <Checkbox
                    className="checkbox"
                    type="checkbox"
                    onChange={handleTaskCompletion}
                    checked={task?.isCompleted}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {task?.title}
              </>
            }
            style={{
              width: 300,
              boxShadow: isDragging ? "0 0 10px rgba(0,0,0,0.2)" : "none",
              transition: "background-color 0.2s, box-shadow 0.2s",
              backgroundColor: !task?.isCompleted ? "#ffffff" : "#f3f3f3", // Меняем цвет фона, чтобы выделить что задача завершена
              opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
            }}
            onClick={showDrawer} // Добавляем проверку, чтобы не открывать задачу при завершенной задаче
          >
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
          </Card>
        </Badge.Ribbon>
      ) : (
        <Card
          title={
            <>
              {(isOwner || task.users.some((user) => user.id === userId)) && (
                <Checkbox
                  className="checkbox"
                  type="checkbox"
                  onChange={handleTaskCompletion}
                  checked={task?.isCompleted}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <span style={{ marginLeft: "5px" }}>{task?.title}</span>
            </>
          }
          style={{
            width: 300,
            boxShadow: isDragging ? "0 0 10px rgba(0,0,0,0.2)" : "none",
            transition: "background-color 0.2s, box-shadow 0.2s",
            backgroundColor: !task?.isCompleted ? "#ffffff" : "#f3f3f3", // Меняем цвет фона, чтобы выделить что задача завершена
            opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
          }}
          onClick={showDrawer}>
          <div>
            {task?.startDate && <p>Начало: {moment(task?.startDate).locale("ru").format("DD.MM.YYYY")}</p>}
            {task?.endDate && <p>Конец: {moment(task?.endDate).locale("ru").format("DD.MM.YYYY")}</p>}
          </div>

          {task?.users && task?.users.length > 0 && (
            <>
              <Divider orientation="left">Ответственные</Divider>
              <div style={{ display: "flex" }}>
                {task.users.map((user, index) => (
                  <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}` }}>
                    {user.firstName}
                  </Avatar>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
      <Drawer
        title={
          <Flex style={{ justifyContent: "space-between" }}>
            <span>{task?.title}</span>
            <div>
              <ArchiveOutlined
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleArchiveTask(userId, boardId, task.stateId, task.id);
                }}></ArchiveOutlined>
              <DeleteOutline color="error" style={{ cursor: "pointer" }} onClick={showDeleteConfirm}></DeleteOutline>
            </div>
          </Flex>
        }
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        width={640}>
        <p>{task.description}</p>
        <Divider orientation="left">
          <CalendarOutlined />
          <> </>Срок выполнения
        </Divider>
        {task?.startDate && task?.startDate && (
          <p>
            <CalendarOutlined /> {moment(task?.startDate).locale("ru").format("DD.MM.YYYY")} -{" "}
            {moment(task?.endDate).locale("ru").format("DD.MM.YYYY")}
          </p>
        )}

        <Divider orientation="left">
          <UserOutlined />
          <> </>Ответственные
        </Divider>
        {task?.users && task?.users.length > 0 && (
          <>
            {task?.users?.map((user) => (
              <Avatar key={user.id} style={{ backgroundColor: `${stringToColor(user.firstName)}` }}>
                {user.firstName}
              </Avatar>
            ))}
          </>
        )}
        <Divider orientation="left">Метки</Divider>
        {task?.priority && (
          <Tag key={`${task?.priority?.name}`} color={`${task?.priority?.color}`}>
            {`${task?.priority?.name}`}
          </Tag>
        )}
        <p>
          <CheckCircleOutlined /> Статус: {task?.isCompleted ? <>Задача завершена</> : <>Не завершена</>}
        </p>

        <Divider />
        {/* <div>
          <p>Подзадачи:</p>
          <List
            dataSource={[
              { label: "Подзадача 1", value: "apple" },
              { label: "Подзадача 2", value: "banana" },
              { label: "Подзадача 3", value: "orange" },
            ]}
            renderItem={(item) => (
              <List.Item>
                <Checkbox>{item.label}</Checkbox>
              </List.Item>
            )}
          />
        </div>
        <Divider /> */}
        <Comments userId={userId} boardId={boardId} stateId={task.stateId} taskId={task.id}></Comments>
        <Button onClick={showUpdateConfirm}>Изменить задачу</Button>
      </Drawer>
      {/* <Drawer
        width={640}
        title={
          <Flex style={{ justifyContent: "space-between" }}>
            <span>{task?.title}</span>
            <DeleteOutline
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => {
                deleteTask(task?.stateId, task?.id);
              }}></DeleteOutline>
          </Flex>
        }
        onClose={onClose}
        open={open}>
        <p>{task?.description}</p>
        <p>Start Date: {task?.startDate}</p>
        <p>End Date: {task?.endDate}</p>
        <p>Responsible:</p>
        <ul>
          {task?.users?.map((person, index) => (
            <li key={person.id}>{person.name}</li>
          ))}
        </ul>
  
        <p style={{ border: "1px dashed", padding: "5px" }}>Стартовая дата: {task.startDate}</p>
        <p style={{ border: "1px dashed", padding: "5px", backgroundColor: new Date(task.endDate) < new Date() ? "red" : "transparent" }}>
          Конечная дата: {task.endDate}
        </p>
        <Button>Edit Task</Button>
      </Drawer> */}
    </div>
  );
};

export default TaskCard;
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
