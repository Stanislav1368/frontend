import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { login } from "../../api";
import { Form, Input, Button, message, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./LoginPage.css";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const mutation = useMutation((data) => login(data), {
    onSuccess: () => navigate("/boards"),
  });

  const navigate = useNavigate();

  const handleLogin = async (values) => {

    try {
      setLoading(true);
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error(error);
      message.error("Неверная почта или пароль");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card>
        <Form onFinish={handleLogin}>
          <h1>Вход</h1>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Пожалуйста, введите почту!" },
              {
                type: "email",
                message: "Пожалуйста, введите корректный адрес почты!",
              },
            ]}>
            <Input prefix={<UserOutlined />} placeholder="Почта" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={loading}>
              Войти
            </Button>
          </Form.Item>

          <a href="/registration">Регистрация</a>
        </Form>
      </Card>
    </div>
  );
};
export default LoginPage;
