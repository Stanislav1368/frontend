import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import LoginPage from "./Pages/Login/LoginPage";
import RegistrationPage from "./Pages/Registration/RegistrationPage";
import Board from "./Pages/Boards/Board";
import Boards from "./Pages/Boards/Boards";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwtDecode(token); // декодирование токена
    return decodedToken.exp * 1000 > Date.now(); // проверка срока действия токена
  }
  return false;
};
const RequireAuth = ({ children }) => {
  if (isAuthenticated()) {
    return children;
  } else {
    // Проверка на устаревший токен и перенаправление на страницу входа
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <RequireAuth>
                  <Navigate to="/boards" />
                </RequireAuth>
              }></Route>
            <Route
              index
              path="boards/"
              element={
                <RequireAuth>
                  <Boards />
                </RequireAuth>
              }></Route>
            <Route
              path="boards/:boardId"
              element={
                <RequireAuth>
                  <Board />
                </RequireAuth>
              }></Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
import React, { useState } from "react";
import { Card, Drawer, Button, Tag, Avatar, Divider } from "antd";
import { UserOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
const KanbanBoard = () => {
  const tasks = [
    {
      id: 1,
      title: "Разработка новой функциональности",
      description: "Необходимо добавить новую функциональность на сайт",
      detailedDescription: "Новая функциональность должна включать в себя abc и xyz",
      assignees: [
        { id: 1, name: "Иван", avatar: "https://example.com/avatar1.jpg" },
        { id: 2, name: "Мария", avatar: "https://example.com/avatar2.jpg" },
      ],
      tags: ["frontend", "feature"],
      dueDate: "2024-03-15",
      status: "В процессе",
      subtasks: [
        { id: 1, title: "Разработать интерфейс" },
        { id: 2, title: "Написать тесты" },
      ],
    },
    {
      id: 2,
      title: "Обновление дизайна главной страницы",
      description: "Требуется обновить дизайн главной страницы сайта",
      detailedDescription: "Дизайн должен быть современным и привлекательным",
      assignees: [{ id: 3, name: "Петр", avatar: "https://example.com/avatar3.jpg" }],
      tags: ["design", "frontend"],
      dueDate: "2024-03-10",
      status: "Завершено",
      subtasks: [
        { id: 3, title: "Создать макеты" },
        { id: 4, title: "Произвести анализ конкурентов" },
      ],
    },
    // Добавьте здесь больше задач по желанию
  ];

  return (
    <div>
      {tasks.map((task) => (
        <KanbanTask key={task.id} task={task} />
      ))}
    </div>
  );
};
const KanbanTask = ({ task }) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const showTaskDetails = () => {
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <>
      <Card
        title={task.title}
        extra={
          <Button type="primary" onClick={showTaskDetails}>
            Подробнее
          </Button>
        }
        style={{ width: 300 }}>
        <p>{task.description}</p>
      </Card>
      <Drawer title={task.title} placement="right" closable={true} onClose={closeDrawer} visible={showDrawer} width={400}>
        <p>{task.detailedDescription}</p>
        <Divider />
        <p>
          <CalendarOutlined /> Срок выполнения: {task.dueDate}
        </p>
        <p>
          <CheckCircleOutlined /> Статус: {task.status}
        </p>
        <Divider />
        <div>
          <p>
            <UserOutlined /> Ответственные:
          </p>
          {task.assignees.map((assignee) => (
            <Avatar key={assignee.id} src={assignee.avatar} style={{ marginRight: 8 }} />
          ))}
        </div>
        <Divider />
        <div>
          <p>Метки:</p>
          {task.tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </div>
        {task.subtasks && (
          <>
            <Divider />
            <div>
              <p>Подзадачи:</p>
              <ul>
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id}>{subtask.title}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};
