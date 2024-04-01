import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";
import "moment/locale/ru"; // Импортируйте локаль, если нужно


// Настройка глобального использования moment.js в Ant Design

import ruRU from "antd/lib/locale/ru_RU"; // Используйте свою локаль
import { ConfigProvider } from "antd";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ConfigProvider locale={ruRU}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ConfigProvider>
);
