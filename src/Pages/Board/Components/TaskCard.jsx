import React, { useEffect, useRef, useState } from "react";
import { QueryClient, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import dayjs from "dayjs";
import { CalendarOutlined, CheckCircleOutlined, CheckOutlined, ExclamationCircleOutlined, PlusCircleOutlined, UserOutlined } from "@ant-design/icons";
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
  message,
  Select,
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

const TaskCard = ({ task, isDragging, deleteTask, userId, boardId, usersBoard, priorities }) => {
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
  console.log(priorities);
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
      onOk: () => {
        deleteTask(task?.stateId, task?.id);
        queryClient.invalidateQueries(["notificationsForUser"]);
        queryClient.invalidateQueries("notificationsForUser");
      },
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
  console.log(task);
  return (
    <div style={{ marginBottom: "10px" }}>
      {task?.priority ? (
        <Badge.Ribbon
          text={`${task?.priority?.name}`}
          color={`${task?.priority?.color}`}
          style={{
            opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
          }}>
          <Card
            title={
              <>
                <Checkbox
                  className="checkbox"
                  type="checkbox"
                  onChange={handleTaskCompletion}
                  checked={task?.isCompleted}
                  onClick={(e) => e.stopPropagation()}
                  disabled={
                    !(isOwner || task.users.some((user) => user.id === userId) || (task.creater === userId && currentRole.name === "Редактор"))
                  }
                />

                <span style={{ marginLeft: "5px" }}>{task?.title}</span>
              </>
            }
            style={{
              width: 300,
              boxShadow: isDragging ? "0 0 10px rgba(0,0,0,0.5)" : "0 0 2px rgba(0,0,0,0.2)",
              transition: "background-color 0.2s, box-shadow 0.2s",
              backgroundColor: !task?.isCompleted ? "#ffffff" : "#f3f3f3", // Меняем цвет фона, чтобы выделить что задача завершена
              opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
            }}
            onClick={showDrawer}>
            <div>
              {task?.startDate && <p>Начало: {moment(task?.startDate).locale("ru").format("DD.MM.YYYY")}</p>}
              {task?.endDate && <p>Конец: {moment(task?.endDate).locale("ru").format("DD.MM.YYYY")}</p>}
            </div>
            {subTasks?.length > 0 && (
              <>
                <Progress
                  percent={subTasks.length > 0 ? ((subTasks.filter((subtask) => subtask.isCompleted).length / subTasks.length) * 100).toFixed(1) : 0}
                />
              </>
            )}

            {/* <SubTasksList subTasks={subTasks}></SubTasksList> */}
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
        </Badge.Ribbon>
      ) : (
        <Card
          title={
            <>
              <Checkbox
                className="checkbox"
                type="checkbox"
                onChange={handleTaskCompletion}
                checked={task?.isCompleted}
                onClick={(e) => e.stopPropagation()}
                disabled={!(isOwner || task.users.some((user) => user.id === userId) || (task.creater === userId && currentRole.name === "Редактор"))}
              />

              <span style={{ marginLeft: "5px" }}>{task?.title}</span>
            </>
          }
          style={{
            width: 300,
            boxShadow: isDragging ? "0 0 10px rgba(0,0,0,0.5)" : "0 0 2px rgba(0,0,0,0.2)",
            transition: "background-color 0.2s, box-shadow 0.2s",
            backgroundColor: !task?.isCompleted ? "#ffffff" : "#f3f3f3", // Меняем цвет фона, чтобы выделить что задача завершена
            opacity: task?.isCompleted ? 0.6 : 1, // Уменьшаем немного прозрачность для дизейбленной карточки
          }}
          onClick={showDrawer}>
          <div>
            {task?.startDate && <p>Начало: {moment(task?.startDate).locale("ru").format("DD.MM.YYYY")}</p>}
            {task?.endDate && <p>Конец: {moment(task?.endDate).locale("ru").format("DD.MM.YYYY")}</p>}
          </div>
          {subTasks?.length > 0 && (
            <>
              <Progress
                percent={subTasks.length > 0 ? ((subTasks.filter((subtask) => subtask.isCompleted).length / subTasks.length) * 100).toFixed(1) : 0}
              />
            </>
          )}

          {/* <SubTasksList subTasks={subTasks}></SubTasksList> */}
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
            currentRole={currentRole}
            showUpdateConfirm={showUpdateConfirm}
          />
        }
        placement="right"
        closable={true}
        onClose={onClose}
        open={open}
        width={640}>
        <TaskInfo
          isOwner={isOwner}
          currentRole={currentRole}
          task={task}
          stringToColor={stringToColor}
          moment={moment}
          userId={userId}
          boardId={boardId}
          usersBoard={usersBoard}
          priorities={priorities}
        />
        <SubTasksList
          task={task}
          isOwner={isOwner}
          userId={userId}
          currentRole={currentRole}
          subTasks={subTasks}
          handleSubTaskCompletion={handleSubTaskCompletion}
          handleAddSubTask={handleAddSubTask}
        />
        {(currentRole?.name === "Администратор" ||
          (task.creater === userId && currentRole.name === "Редактор") ||
          isOwner ||
          task.users.some((user) => user.id === userId)) && <FileComponent currentRole={currentRole} taskId={task?.id} />}

        <Comments
          currentRole={currentRole}
          userId={userId}
          boardId={boardId}
          stateId={task.stateId}
          taskId={task.id}
          canComments={
            task.users.some((user) => user.id === userId) ||
            currentRole?.name === "Администратор" ||
            (task.creater === userId && currentRole.name === "Редактор") ||
            isOwner
          }></Comments>
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
const TaskHeader = ({ task, userId, boardId, handleArchiveTask, showDeleteConfirm, isOwner, showUpdateConfirm, currentRole }) => {
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
  console.log(isOwner || currentRole?.name === "Администратор" || task.creater === userId);
  return (
    <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
      {isEditing && (isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор") ? (
        <>
          <Input
            ref={titleInputRef}
            variant="borderless"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => handleFocusChange(false)}
          />
          <Button onClick={handleUpdateTask}>
            <CheckOutlined />
          </Button>
        </>
      ) : (
        <>
          <div>
            <span onClick={() => setIsEditing(true)}>{task?.title}</span>: {task?.isCompleted ? <>Задача завершена</> : <>Не завершена</>}
          </div>

          <div style={{ display: "flex", gap: "3px", flexDirection: "row" }}>
            {(isOwner || currentRole?.name === "Администратор" || task.creater === userId) && (
              <ArchiveOutlined
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleArchiveTask(userId, boardId, task.stateId, task.id);
                }}></ArchiveOutlined>
            )}
            {(isOwner || currentRole?.name === "Администратор" || task.creater === userId) && (
              <DeleteOutline color="error" style={{ cursor: "pointer" }} onClick={showDeleteConfirm}></DeleteOutline>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Компонент с информацией о задаче
const TaskInfo = ({ task, stringToColor, userId, boardId, usersBoard, currentRole, isOwner, priorities }) => {
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

  const handleUpdateTaskDesc = async (desc) => {
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
  const [selectedPriority, setSelectedPriority] = useState(null);
  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
    }
    if (isEditingDate && dateInputRef.current) {
      dateInputRef.current.focus();
    }
  }, [isEditingDesc, isEditingDate]);
  const [replaceLabelVisible, setReplaceLabelVisible] = useState(false);
  const toggleReplaceLabel = () => {
    setReplaceLabelVisible(!replaceLabelVisible);
  };
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

              {(isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор") && (
                <Checkbox checked={isUserResponsible} onChange={(e) => handleChangeTaskUsers(user.id, e.target.checked)} />
              )}
            </Flex>
          </Menu.Item>
        );
      })}
    </Menu>
  );
  useEffect(() => {
    // Проверяем, есть ли у задачи метка
    if (task && task.priority) {
      setSelectedPriority(task.priority.id); // Устанавливаем id текущей метки в selectedPriority
    }
  }, [task]);
  const handleReplaceLabel = async () => {
    try {
      // Проверяем, что выбрана метка
      if (!selectedPriority) {
        // Если метка не выбрана, вы можете показать сообщение об ошибке или выполнить другие действия
        return;
      }

      // Вызываем функцию updateTask с необходимыми параметрами
      await updateTask(userId, boardId, task.stateId, task.id, { priorityId: selectedPriority });
      queryClient.invalidateQueries(["columns"]);
      toggleReplaceLabel();
    } catch (error) {
      // Обработка ошибок, если они произошли при обновлении задачи
      console.error("Error updating task:", error);
      // Возможно, здесь вы захотите показать пользователю сообщение об ошибке или выполнить другие действия
    }
  };
  return (
    <>
      {task.dependentTask && <>Родительская задача: {task?.dependentTask?.title}</>}
      <Divider orientation="left">Описание</Divider>
      {isEditingDesc && (isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор") ? (
        <>
          <Input.TextArea
            ref={descInputRef}
            type="text"
            value={formData.newDesc}
            onChange={(e) => setFormData({ ...formData, newDesc: e.target.value })}
            onBlur={() => handleDescFocusChange(false)}
          />
          <Button onClick={handleUpdateTaskDesc}>
            <CheckOutlined />
          </Button>
        </>
      ) : (
        <p onClick={() => setIsEditingDesc(true)}>
          {task.description} {task.description.length === 0 && <Button>Добавить описание...</Button>}
        </p>
      )}

      <Divider orientation="left">
        <CalendarOutlined /> Срок выполнения
      </Divider>

      <Flex style={{ alignItems: "center" }}>
        {isEditingDate && (isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор") ? (
          <>
            <DatePicker.RangePicker ref={dateInputRef} value={formData.selectedDates} onChange={handleRangeChange} />
            <Button style={{ marginLeft: "5px" }} onClick={handleUpdateTaskDate}>
              <CheckOutlined />
            </Button>
          </>
        ) : (
          <>
            {task.startDate && task.endDate ? (
              <>
                <CalendarOutlined /> {moment(task.startDate).locale("ru").format("DD.MM.YYYY")} -{" "}
                {moment(task.endDate).locale("ru").format("DD.MM.YYYY")}
              </>
            ) : (
              <span>Сроков нет</span>
            )}
            {isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор" ? (
              <EditOutlined onClick={() => setIsEditingDate(true)} />
            ) : null}
          </>
        )}
      </Flex>

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

        {(isOwner || (task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор") && (
          <Flex style={{ alignItems: "center" }}>
            <Dropdown overlay={dropdownData} trigger={["click"]}>
              <Avatar style={{ cursor: "pointer" }} onClick={(e) => e.preventDefault()} icon={<AddOutlined />}></Avatar>
            </Dropdown>
          </Flex>
        )}
      </Flex>
      <Divider orientation="left">Метки</Divider>

      {!replaceLabelVisible ? (
        <>
          {task?.priority && (
            <Tag
              key={task.priority.name}
              color={task.priority.color}
              style={{ cursor: "pointer" }}
              closable
              onClose={async (e) => {
                e.stopPropagation();
                await updateTask(userId, boardId, task.stateId, task.id, { priorityId: null });
                queryClient.invalidateQueries(["columns"]);
                message.success(`Метка для задачи "${task.title}" успешно удалена`);
              }}>
              {task.priority.name}
            </Tag>
          )}
          <Button type="link" onClick={toggleReplaceLabel}>
            Поменять метку
          </Button>
        </>
      ) : (
        <Flex style={{ gap: "8px" }}>
          <Select defaultValue={task.priority?.name} onChange={(value) => setSelectedPriority(value)} style={{ width: 120 }}>
            {priorities.map((priority) => (
              <Option key={priority.id} value={priority.id}>
                {priority.name}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleReplaceLabel}>
            Поменять метку
          </Button>
          <Button onClick={toggleReplaceLabel}>Отмена</Button>
        </Flex>
      )}
    </>
  );
};

const SubTasksList = ({ subTasks, handleSubTaskCompletion, handleAddSubTask, currentRole, userId, isOwner, task }) => {
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
            <Flex>
              <Checkbox
                className="checkbox"
                type="checkbox"
                onChange={() => {
                  handleSubTaskCompletion(subtask);
                }}
                checked={subtask?.isCompleted}
                disabled={
                  !(
                    isOwner ||
                    task.users.some((user) => user.id === userId) ||
                    (task.creater === userId && currentRole.name === "Редактор") ||
                    currentRole.name === "Администратор"
                  )
                }
              />
              <span>{subtask.title}</span>
            </Flex>
          </List.Item>
        )}
      />
      {((task.creater === userId && currentRole.name === "Редактор") || currentRole.name === "Администратор" || isOwner) && (
        <Form onFinish={handleAddSubTask}>
          <Form.Item name="subtaskName" rules={[{ required: true, message: "Введите название подзадачи" }]}>
            <Input placeholder="Введите название подзадачи" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Добавить подзадачу
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
