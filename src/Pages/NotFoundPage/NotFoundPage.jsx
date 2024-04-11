import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="К сожалению, у вас нет прав доступа к этой странице."
    extra={
      <Link to="/boards">
        <Button type="primary">Вернуться на главную</Button>
      </Link>
    }
  />
);

export default NotFoundPage;
