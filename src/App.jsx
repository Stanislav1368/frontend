import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import LoginPage from "./Pages/Login/LoginPage";
import RegistrationPage from "./Pages/Registration/RegistrationPage";
import Board from "./Pages/Board/Board";
import Boards from "./Pages/Boards/Boards";
import UserProfile from "./Pages/UserProfile/UserProfile";
import NotFoundPage from "./Pages/NotFoundPage/NotFoundPage";

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
              path="/profile"
              element={
                <RequireAuth>
                  <UserProfile />
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
              path="boards/:boardId/*"
              element={
                <RequireAuth>
                  <Board />
                </RequireAuth>
              }></Route>
            <Route path="page404" element={<NotFoundPage />}></Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
