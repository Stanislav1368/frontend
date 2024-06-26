import React, { useState } from "react";
import { Card, Typography, Modal, Form, Input, DatePicker, Checkbox, Select, Button, Flex, InputNumber } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { addState, addTask, deleteState, deleteTask, getCurrentRole, getRoleByBoardId, updateStateTitle } from "../../../api";
import { PlusOutlined } from "@ant-design/icons";
import "./KanbanBoard.css";
import TaskCard from "./TaskCard";
import { useQuery, useQueryClient } from "react-query";
import { DeleteOutline } from "@mui/icons-material";
const { RangePicker } = DatePicker;

const KanbanBoard = ({ columns, updateColumns, boardId, userId, users, priorities, selectedUsers, selectedPriorities }) => {
  
  const queryClient = useQueryClient();
  const { data: currentRole, isLoading: currentRoleLoading } = useQuery("currentRole", () => getCurrentRole(userId, boardId));
  const { data: isOwner, isLoading: ownerLoading } = useQuery("isOwner", () => getRoleByBoardId(userId, boardId));

  const [editingColumnId, setEditingColumnId] = useState(null);
  const handleAddState = async () => {
    try {
      const defaultColumns = [{ title: "Backlog" }, { title: "В разработке" }, { title: "Тестирование" }, { title: "Готово" }];
      
      for (const column of defaultColumns) {
        const newColumn = await addState(column, userId, boardId);
        queryClient.setQueryData(["columns", userId, boardId], (prevColumns) => [...prevColumns, newColumn]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const newColumns = { ...columns };

    if (source.droppableId === destination.droppableId) {
      const column = newColumns[source.droppableId];
      const newTasks = Array.from(column.tasks);
      const [draggedItem] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, draggedItem);
      newTasks.forEach((task, index) => {
        task.order = index;
      });
      newColumns[source.droppableId] = {
        ...column,
        tasks: newTasks,
      };
    } else {
      const startColumn = newColumns[source.droppableId];
      const finishColumn = newColumns[destination.droppableId];
      const startTasks = Array.from(startColumn.tasks);
      const finishTasks = Array.from(finishColumn.tasks);
      const [draggedItem] = startTasks.splice(source.index, 1);
      finishTasks.splice(destination.index, 0, draggedItem);

      draggedItem.stateId = finishColumn.id;
      startTasks.forEach((task, index) => {
        task.order = index;
      });
      finishTasks.forEach((task, index) => {
        task.order = index;
      });

      newColumns[source.droppableId] = {
        ...startColumn,
        tasks: startTasks,
      };
      newColumns[destination.droppableId] = {
        ...finishColumn,
        tasks: finishTasks,
      };
    }

    // Обновляем данные в кеше и на сервере
    updateColumns(newColumns);
  };
  const [form] = Form.useForm();

  const [selectedColumnId, setSelectedColumnId] = useState("");

  const handleOpenTaskModal = (stateId) => {
    const column = columns.find((column) => column.id === stateId);
    setSelectedColumnId(column.id);

    setOpenAddTaskModal(true);
  };
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false);
  const handleDeleteTask = async (columnId, taskId) => {
    await deleteTask(userId, boardId, columnId, taskId);
    queryClient.setQueryData(["columns", userId, boardId], (prevColumns) => {
      return prevColumns.map((column) => {
        if (column.id === columnId) {
          // Исключаем задачу с заданным taskId из списка задач столбца
          const updatedTasks = column.tasks.filter((task) => task.id !== taskId);

          return {
            ...column,
            tasks: updatedTasks,
          };
        }

        return column;
      });
    });
  };
  const handleAddTask = async (values) => {
    setOpenAddTaskModal(false);

    try {
      const addedTask = await addTask(values, userId, boardId, selectedColumnId);

      queryClient.setQueryData(["columns", userId, boardId], (prevColumns) => {
        return prevColumns.map((column) => {
          if (column.id === selectedColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, addedTask],
            };
          }

          return column;
        });
      });
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  };
  if (!ownerLoading || !currentRoleLoading) {
  }

  if ((!columns || columns.length === 0) && (isOwner || currentRole.name === "Администратор")) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card title="На доске пока что нет столбцов состояний">
          <p>Вы можете добавить базовые секции (backlog, в разработке, тестирование, готово), чтобы начать работу.</p>
          <Button type="primary" onClick={handleAddState}>
            Добавить
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "10px", height: "100%", width: "100%" }}>
          {columns &&
            typeof columns === "object" &&
            Object.keys(columns)
              ?.sort((a, b) => parseInt(a) - parseInt(b))
              .map((columnId) => {
                const column = columns[columnId];
                return (
                  <div key={column?.id} style={{ display: "flex", flexDirection: "column" }}>
                    <ColumnHeader
                      currentRole={currentRole}
                      isOwner={isOwner}
                      column={column}
                      handleOpenTaskModal={handleOpenTaskModal}
                      userId={userId}
                      boardId={boardId}
                      editingColumnId={editingColumnId}
                      setEditingColumnId={setEditingColumnId}></ColumnHeader>
                    <Droppable droppableId={`${columnId}`}>
                      {(provided) => (
                        <div style={{ display: "flex", flexDirection: "column", flex: "1" }} ref={provided.innerRef} {...provided.droppableProps}>
                          {column?.tasks
                            ?.sort((a, b) => a.order - b.order)
                            .map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={`${task.id}`}
                                index={index}
                                isDragDisabled={
                                  (!isOwner && task.creater !== userId ) ||           
                                  selectedUsers.length > 0 ||
                                  selectedPriorities.length > 0
                                }>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    {!task.isArchived && (
                                      <TaskCard
                                        task={task}
                                        isDragging={snapshot.isDragging}
                                        deleteTask={handleDeleteTask}
                                        userId={userId}
                                        boardId={boardId}
                                        usersBoard={users}
                                        priorities={priorities}
                                      />
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
        </div>
      </DragDropContext>
      <Modal
        title={`Добавление задачи`}
        open={openAddTaskModal}
        onCancel={() => {
          setOpenAddTaskModal(false);
          form.resetFields();
        }}
        footer={null}>
        <Form form={form} onFinish={handleAddTask} layout="vertical">
          <Form.Item label="Заголовок" name="title" rules={[{ required: true, message: "Введите заголовок" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Выберите даты" name="dates">
            <RangePicker />
          </Form.Item>
          <Form.Item
            label="Время на задачу в часах"
            name="hours"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const dates = getFieldValue("dates");
                  if ((!dates || dates.length === 0) && (!value || value === 0)) {
                    return Promise.resolve();
                  }
                  if ((!dates || dates.length === 0) && value) {
                    return Promise.reject("Пожалуйста, выберите даты перед вводом времени на задачу в часах");
                  }
                  // if (dates && dates.length > 0 && (!value || value === 0)) {
                  //   return Promise.reject("Пожалуйста, введите время на задачу в часах");
                  // }
                  return Promise.resolve();
                },
              }),
            ]}>
            <InputNumber />
          </Form.Item>
          <Form.Item label="Ответственные" name="userIds">
            <Checkbox.Group>
              {users?.map((user) => (
                <Checkbox key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Метка" name="priorityId">
            <Select>
              {priorities?.map((priority) => (
                <Select.Option key={priority.id} value={priority.id}>
                  {priority.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Родительская задача" name="dependentTaskId">
            <Select>
              {columns?.map((column) =>
                column?.tasks?.map((task) => (
                  <Option key={task.id} value={task.id}>
                    {task.title}
                  </Option>
                ))
              )}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Добавить задачу
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
const ColumnHeader = ({ column, handleOpenTaskModal, userId, boardId, editingColumnId, setEditingColumnId, currentRole, isOwner }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(column?.title);

  const handleTitleClick = (id) => {
    if (!isEditing && editingColumnId === null) {
      setIsEditing(true);
      setEditingColumnId(id);
    }
  };
  const handleCancelEdit = () => {
    setNewTitle(column.title);
    setIsEditing(false);
    setEditingColumnId(null);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === "OK") {
      handleTitleUpdate();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };
  const handleTitleUpdate = async () => {
    if (newTitle.trim() !== "" && newTitle !== column.title) {
      await updateStateTitle(userId, boardId, editingColumnId, newTitle);

      queryClient.setQueryData(["columns", userId, boardId], (oldData) => {
        if (!oldData) return oldData;

        const updatedColumns = oldData.map((col) => {
          if (col.id === editingColumnId) {
            return { ...col, title: newTitle };
          }
          return col;
        });

        return updatedColumns;
      });
    }

    setIsEditing(false);
    setEditingColumnId(null);
  };

  return (
    <Card bodyStyle={{ padding: "15px" }} style={{ marginBottom: "10px", padding: "0px", width: "300px", height: "60px", alignItems: "center" }}>
      {isEditing && editingColumnId === column.id ? (
        <Flex style={{ justifyContent: "space-between" }}>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleTitleUpdate}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
          />

          {(currentRole?.name === "Администратор" || currentRole?.name === "Редактор" || isOwner) && (
            <Typography.Title level={4} style={{ margin: "0", padding: "0px" }}>
              <PlusOutlined onClick={() => handleOpenTaskModal(column?.id)} />
            </Typography.Title>
          )}
        </Flex>
      ) : (
        <Flex style={{ justifyContent: "space-between" }}>
          <Flex style={{ alignItems: "center" }}>
            <Typography.Title
              level={4}
              style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0px" }}
              onClick={() => handleTitleClick(column.id)}>
              {column?.title}
            </Typography.Title>
            {(currentRole?.name === "Редактор" || currentRole?.name === "Администратор" || isOwner) && (
              <DeleteOutline
                color="error"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  Modal.confirm({
                    title: "Вы уверены, что хотите удалить столбец?",
                    okType: "danger",
                    content: "Это действие нельзя отменить.",
                    onOk: async () => {
                    
                      await deleteState(userId, boardId, column?.id);
                      queryClient.invalidateQueries("columns");
                    },
                  })
                }></DeleteOutline>
            )}
          </Flex>

          {(currentRole?.name === "Редактор" || currentRole?.name === "Администратор" || isOwner) && (
            <Flex style={{ alignItems: "center" }}>
              <Typography.Title level={4} style={{ margin: "0", padding: "0px" }}>
                <PlusOutlined onClick={() => handleOpenTaskModal(column?.id)} />
              </Typography.Title>
            </Flex>
          )}
        </Flex>
      )}
    </Card>
  );
};
export default KanbanBoard;
