import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { registration } from "../../api";
import "./RegistrationPage.css";
import { Form, Input, Button, Card, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const mutation = useMutation((data) => registration(data), {
    onSuccess: () => navigate("/login"),
  });

  const handleRegistration = async ({ confirmPassword, ...values }) => {
    console.log(values);
    try {
      setLoading(true);
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error(error);
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card>
        <Form name="registration_form" onFinish={handleRegistration}>
          <h1>Регистрация</h1>
          <Form.Item name="firstName" rules={[{ required: true, message: "Пожалуйста, введите имя!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Имя" />
          </Form.Item>
          <Form.Item name="lastName" rules={[{ required: true, message: "Пожалуйста, введите фамилию!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Фамилия" />
          </Form.Item>
          <Form.Item name="middleName">
            <Input prefix={<UserOutlined />} placeholder="Отчество" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Пожалуйста, введите почту!" },
              {
                type: "email",
                message: "Пожалуйста, введите корректный адрес почты!",
              },
            ]}>
            <Input prefix={<MailOutlined />} placeholder="Почта" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Пожалуйста, введите пароль!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Пожалуйста, подтвердите пароль!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают!"));
                },
              }),
            ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Подтвердите пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={loading}>
              Зарегистрироваться
            </Button>
          </Form.Item>

          <a href="/login">Уже есть аккаунт?</a>
        </Form>
      </Card>
    </div>
  );
};

export default RegistrationPage;
