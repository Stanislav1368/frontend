import React, { useEffect, useRef, useState } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import dayjs from "dayjs";
import { CalendarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, PlusCircleOutlined, UserOutlined } from "@ant-design/icons";
import {
  AddOutlined,
  Archive,
  ArchiveOutlined,
  CloseOutlined,
  Delete,
  DeleteOutline,
  DeleteOutlineOutlined,
  EditOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Menu,
  Checkbox,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Space,
  Tag,
  Dropdown,
} from "antd";
import Comments from "../../../Components/Comments";
import {
  addSubTask,
  getCurrentRole,
  getRoleByBoardId,
  getSubTasks,
  taskChangeArchivingStatus,
  updateSubTaskIsCompleted,
  updateTask,
  updateTaskIsCompleted,
  updateTaskUsers,
} from "../../../api";
import FileComponent from "./FileComponent";

const TaskCard = ({ task, isDragging, deleteTask, userId, boardId, usersBoard }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);
  const [userIds, setUserIds] = useState(task?.userIds || []);
  const [priorityId, setPriorityId] = useState(task.priorityId);

  const [startDate, setStartDate] = useState(task.startDate);
  const [endDate, setEndDate] = useState(task.endDate);
  console.log(task.subTasks);
  const { data: currentRole, isLoading: currentRoleLoading } = useQuery("currentRole", () => getCurrentRole(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: subTasks, isLoading: subTasksLoading } = useQuery(["subtasks", task.id], () => getSubTasks(userId, boardId, task.stateId, task.id), {
    enabled: !!task,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  console.log(subTasks);
  const handleUpdateTask = async (values) => {
    console.log(values);
    try {
      await updateTask(userId, boardId, task.stateId, task.id, values);
      queryClient.invalidateQueries(["columns"]);
      console.log(1);
      // form.resetFields(); // Сбросить значения полей формы
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
          {console.log(task)}
          <Form.Item name="title" rules={[{ required: true, message: "Пожалуйста, введите название задачи" }]}>
            <Input placeholder="Название задачи" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Описание задачи" />
          </Form.Item>
          <Form.Item name="dates" initialValue={[moment(startDate), moment(endDate)]}>
            <DatePicker.RangePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        form.submit();
      },
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
    updateTaskIsCompleted(userId, boardId, task?.stateId, task.id, { isCompleted: !task.isCompleted }).then(() => {
      queryClient.invalidateQueries(["columns"]);
      queryClient.invalidateQueries(["subtasks", task?.id]);
    });
  };
  const handleSubTaskCompletion = (subtask) => {
    const updatedIsCompleted = !subtask.isCompleted;
    updateSubTaskIsCompleted(userId, boardId, task?.stateId, task.id, subtask.id, { isCompleted: updatedIsCompleted }).then(() => {
      queryClient.invalidateQueries(["subtasks", task?.id]);
      queryClient.invalidateQueries(["columns"]);
    });
  };
  const handleAddSubTask = async (values) => {
    console.log(values);
    await addSubTask(userId, boardId, task?.stateId, task?.id, { title: values.subtaskName, taskId: task?.id });
    await queryClient.invalidateQueries(["subtasks", task?.id]);
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
          <TaskHeader
            task={task}
            userId={userId}
            boardId={boardId}
            handleArchiveTask={handleArchiveTask}
            showDeleteConfirm={showDeleteConfirm}
            isOwner={isOwner}
            canAddTasks={currentRole?.canAddTasks}
            showUpdateConfirm={showUpdateConfirm}
          />
        }
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        width={640}>
        <TaskInfo task={task} stringToColor={stringToColor} moment={moment} userId={userId} boardId={boardId} usersBoard={usersBoard} />
        <SubTasksList subTasks={subTasks} handleSubTaskCompletion={handleSubTaskCompletion} handleAddSubTask={handleAddSubTask} />
        <FileComponent taskId={task?.id}/>
        <Comments userId={userId} boardId={boardId} stateId={task.stateId} taskId={task.id}></Comments>
      </Drawer>
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
const TaskHeader = ({ task, userId, boardId, handleArchiveTask, showDeleteConfirm, isOwner, canAddTasks, showUpdateConfirm }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task?.title);

  const titleInputRef = useRef(null);

  const handleUpdateTask = async () => {
    await updateTask(userId, boardId, task.stateId, task.id, { title: newTitle });
    queryClient.invalidateQueries(["columns"]);
    setIsEditing(false);
  };

  const handleFocusChange = (focused) => {
    if (!focused && isEditing) {
      handleUpdateTask();
    }
  };

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
      {isEditing ? (
        <>
          <Input
            ref={titleInputRef}
            variant="borderless"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => handleFocusChange(false)}
          />
          <Button onClick={handleUpdateTask}>OK</Button>
        </>
      ) : (
        <>
          <div>
            <span onClick={() => setIsEditing(true)}>{task?.title}</span>: {task?.isCompleted ? <>Задача завершена</> : <>Не завершена</>}
          </div>

          <div style={{ display: "flex", gap: "3px", flexDirection: "row" }}>
            {(isOwner || canAddTasks) && <EditOutlined style={{ cursor: "pointer", color: "gray" }} onClick={showUpdateConfirm} />}
            <ArchiveOutlined
              color="primary"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleArchiveTask(userId, boardId, task.stateId, task.id);
              }}></ArchiveOutlined>
            <DeleteOutline color="error" style={{ cursor: "pointer" }} onClick={showDeleteConfirm}></DeleteOutline>
          </div>
        </>
      )}
    </div>
  );
};

// Компонент с информацией о задаче
const TaskInfo = ({ task, stringToColor, userId, boardId, usersBoard }) => {
  const queryClient = useQueryClient();
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingUsers, setIsEditingUsers] = useState(false);
  const [formData, setFormData] = useState({
    newDesc: task.description,
    selectedDates: [moment(task.startDate), moment(task.endDate)],
  });

  const descInputRef = useRef(null);
  const dateInputRef = useRef(null);

  const handleUpdateTaskDesc = async () => {
    await updateTask(userId, boardId, task.stateId, task.id, { description: formData.newDesc });
    queryClient.invalidateQueries(["columns"]);
    setIsEditingDesc(false);
  };
  const handleRangeChange = (dates) => {
    setFormData((prev) => ({ ...prev, selectedDates: dates }));
  };
  const handleUpdateTaskDate = async () => {
    await updateTask(userId, boardId, task.stateId, task.id, { dates: formData.selectedDates });
    queryClient.invalidateQueries(["columns"]);
    setIsEditingDate(false);
  };
  const handleDescFocusChange = (focused) => {
    if (!focused && isEditingDesc) {
      handleUpdateTaskDesc();
    }
  };
  const handleDateFocusChange = (focused) => {
    if (!focused && isEditingDate) {
      handleUpdateTaskDate();
    }
  };
  const handleChangeTaskUsers = async (userId, isChecked) => {
    await updateTaskUsers(userId, boardId, task.stateId, task.id, isChecked);
    queryClient.invalidateQueries(["columns"]);
  };
  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
    }
    if (isEditingDate && dateInputRef.current) {
      dateInputRef.current.focus();
    }
  }, [isEditingDesc, isEditingDate]);

  const dropdownData = (
    <Menu style={{ width: "300px", borderRadius: 0 }}>
      {usersBoard.map((user) => {
        const isUserResponsible = task.users.some((taskUser) => taskUser.id === user.id);
        return (
          <Menu.Item onClick={(e) => e.stopPropagation()} className="hoverElement" key={user.id} style={{ display: "flex", alignItems: "center" }}>
            <Flex style={{ justifyContent: "space-between", alignItems: "center" }}>
              <Flex style={{ alignItems: "center", gap: "5px" }}>
                <Avatar key={user.id} style={{ backgroundColor: stringToColor(user.firstName) }}>
                  {user.firstName}
                </Avatar>
                <span>
                  {user.lastName} {user.firstName} {user.middleName}
                </span>
              </Flex>

              <Checkbox checked={isUserResponsible} onChange={(e) => handleChangeTaskUsers(user.id, e.target.checked)} />
            </Flex>
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <>
      {isEditingDesc ? (
        <>
          <Input.TextArea
            ref={descInputRef}
            type="text"
            value={formData.newDesc}
            onChange={(e) => setFormData({ ...formData, newDesc: e.target.value })}
            onBlur={() => handleDescFocusChange(false)}
          />
          <Button onClick={handleUpdateTaskDesc}>OK</Button>
        </>
      ) : (
        <p onClick={() => setIsEditingDesc(true)}>{task.description}</p>
      )}

      <Divider orientation="left">
        <CalendarOutlined /> Срок выполнения
      </Divider>

      {task?.startDate && task?.endDate && (
        <Flex style={{ alignItems: "center" }}>
          <CalendarOutlined /> {moment(task.startDate).locale("ru").format("DD.MM.YYYY")} - {moment(task.endDate).locale("ru").format("DD.MM.YYYY")}
          {isEditingDate ? (
            <>
              <DatePicker.RangePicker
                ref={dateInputRef}
                value={formData.selectedDates}
                onChange={handleRangeChange}
                onBlur={() => handleDateFocusChange(false)}
              />
              <Button onClick={handleUpdateTaskDate}>OK</Button>
            </>
          ) : (
            <EditOutlined onClick={() => setIsEditingDate(true)} />
          )}
        </Flex>
      )}

      <Divider orientation="left">
        <UserOutlined /> Ответственные
      </Divider>
      <Flex style={{ alignItems: "center" }}>
        {task?.users && task.users.length > 0 && (
          <>
            {task.users.map((user) => (
              <Avatar key={user.id} style={{ backgroundColor: stringToColor(user.firstName) }}>
                {user.firstName}
              </Avatar>
            ))}
          </>
        )}

        <Flex style={{ alignItems: "center" }}>
          <Dropdown overlay={dropdownData} trigger={["click"]}>
            <Avatar style={{ cursor: "pointer" }} onClick={(e) => e.preventDefault()} icon={<AddOutlined />}></Avatar>
          </Dropdown>
        </Flex>
      </Flex>

      <Divider orientation="left">Метки</Divider>

      {task?.priority && (
        <Tag key={task.priority.name} color={task.priority.color}>
          {task.priority.name}
        </Tag>
      )}
    </>
  );
};

// Компонент списка подзадач
const SubTasksList = ({ subTasks, handleSubTaskCompletion, handleAddSubTask }) => {
  return (
    <>
      <Divider orientation="left">Подзадачи</Divider>
      {subTasks?.length > 0 && (
        <>
          <Progress
            strokeColor={{
              "0%": "#ff4d4f",
              "100%": "#52c41a",
            }}
            percent={subTasks.length > 0 ? ((subTasks.filter((subtask) => subtask.isCompleted).length / subTasks.length) * 100).toFixed(1) : 0}
          />
        </>
      )}

      <List
        dataSource={subTasks}
        renderItem={(subtask) => (
          <List.Item key={subtask.id}>
            <Checkbox
              className="checkbox"
              type="checkbox"
              onChange={() => {
                handleSubTaskCompletion(subtask);
              }}
              checked={subtask?.isCompleted}>
              {subtask.title}
            </Checkbox>
          </List.Item>
        )}
      />
      <Form onFinish={handleAddSubTask}>
        <Form.Item name="subtaskName" rules={[{ required: true, message: "Введите название подзадачи" }]}>
          <Input placeholder="Введите название подзадачи" />
        </Form.Item>
        <Form.Item>
          <Button style={{ backgroundColor: "#519839" }} type="primary" htmlType="submit">
            Добавить подзадачу
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
const UserSelectionModal = ({ usersBoard, handleUpdateTaskUsers }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    setIsModalVisible(false);
    try {
      await handleUpdateTaskUsers(selectedUserIds);
      console.log("Task updated successfully with new users.");
      // Дополнительные действия после успешного обновления задачи
    } catch (error) {
      console.error("Error updating task:", error);
      // Обработка ошибок при обновлении задачи
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUserToggle = (userId) => {
    setSelectedUserIds((prevState) => {
      if (prevState.includes(userId)) {
        return prevState.filter((id) => id !== userId);
      } else {
        return [...prevState, userId];
      }
    });
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Открыть модальное окно выбора пользователей
      </Button>
      <Modal title="Выберите пользователей для задачи" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Checkbox.Group onChange={(values) => setSelectedUserIds(values)} value={selectedUserIds}>
          {usersBoard.map((user) => (
            <Checkbox key={user.id} value={user.id}>
              {user.firstName}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </>
  );
};
