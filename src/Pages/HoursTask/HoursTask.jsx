import React from "react";
import { Table } from "antd";
import moment from "moment";

const HoursTask = ({ data }) => {
  // Функция для получения уникальных дат из всех задач
  const getUniqueDates = (tasks) => {
    const datesSet = new Set();
    tasks.forEach((task) => {
      const startDate = new Date(task.startDate).toDateString();
      const endDate = new Date(task.endDate).toDateString();
      const diffDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000;
        datesSet.add(new Date(currentDate).toDateString());
      }
    });
    return Array.from(datesSet);
  };

  // Функция для создания колонок таблицы
  const createColumns = (uniqueDates) => {
    return [
      {
        title: "Название задачи",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Дата начала",
        dataIndex: "startDate",
        key: "startDate",
      },
      {
        title: "Дата завершения",
        dataIndex: "endDate",
        key: "endDate",
      },
      {
        title: "Количество часов",
        dataIndex: "hours",
        key: "hours",
      },
      ...uniqueDates.map((date) => ({
        title: `${moment(date).format("DD.MM.YYYY")}`,
        dataIndex: "dayDistribution",
        key: date,
        render: (distribution, record) => {
          return distribution[date] ? `${distribution[date]} часов` : "";
        },
      })),
    ];
  };

  // Функция для создания строк таблицы
  const createDataSource = (tasks, uniqueDates) => {
    return tasks.map((task) => {
      const startDate = new Date(task.startDate).toDateString();
      const endDate = new Date(task.endDate).toDateString();
      const diffDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

      const dayDistribution = {};
      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000;
        dayDistribution[new Date(currentDate).toDateString()] = (task.hours / diffDays).toFixed(2);
      }

      return {
        ...task,
        startDate: moment(new Date(task.startDate).toDateString()).format("DD.MM.YYYY"),
        endDate: moment(new Date(task.endDate).toDateString()).format("DD.MM.YYYY"),
        dayDistribution,
        key: task.id,
      };
    });
  };
  const uniqueDates = getUniqueDates(data.reduce((acc, item) => acc.concat(item.tasks), []));
  // Получение уникальных дат и создание колонок таблицы
  const tasksData = createDataSource(
    data.reduce((acc, item) => acc.concat(item.tasks), []),
    uniqueDates
  );

  // Создание источника данных для таблицы

  const columns = createColumns(uniqueDates);

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <h2>{item.title}</h2>
          <Table columns={columns} dataSource={tasksData.filter((task) => task.stateId === item.id)} pagination={false} />
        </div>
      ))}
    </div>
  );
};

export default HoursTask;
