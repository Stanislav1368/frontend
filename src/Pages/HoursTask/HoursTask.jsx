import React from "react";
import moment from "moment";
import { Flex, Table } from "antd";
import { useQuery } from "react-query";
import { getCurrentRole, getRoleByBoardId } from "../../api";

const HoursComponent = ({ data, usersBoard }) => {
  return (
    <Flex style={{ flexDirection: "column", gap: "10px" }}>
      {usersBoard.map((user) => {
        return <HoursTask key={user.id} data={data} currentUserId={user.id} userName={`${user.firstName} ${user.lastName}`} />;
      })}
    </Flex>
  );
};

const HoursTask = ({ data, currentUserId, userName }) => {
  if (!data) {
    return <Table loading={true}></Table>;
  }

  const sortTasksById = (tasks) => {
    return tasks.sort((a, b) => a.id - b.id);
  };

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
    return Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
  };

  const createDataSource = (tasks, uniqueDates) => {
    const totalHoursByDate = uniqueDates.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {});

    const dataSource = [];
    tasks.forEach((task) => {
      const isCurrentUserTask = task.users.some((user) => user.id === currentUserId);
      if (!isCurrentUserTask) return;

      const startDate = new Date(task.startDate).toDateString();
      const endDate = new Date(task.endDate).toDateString();
      const diffDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

      const dayDistribution = {};
      if (task.hours) {
        for (let i = 0; i < diffDays; i++) {
          const currentDate = new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000;
          const currentDateString = new Date(currentDate).toDateString();
          const hours = (task.hours / diffDays).toFixed(2);
          dayDistribution[currentDateString] = hours;
          totalHoursByDate[currentDateString] = (totalHoursByDate[currentDateString] || 0) + parseFloat(hours);
        }
      }
      dataSource.push({
        ...task,
        startDate: task.startDate ? moment(new Date(task.startDate).toDateString()).format("DD.MM.YYYY") : null,
        endDate: task.endDate ? moment(new Date(task.endDate).toDateString()).format("DD.MM.YYYY") : null,
        responsible: task.users.map((user) => `${user.firstName} ${user.lastName}`).join(", "),
        dayDistribution,
        key: task.id,
      });
    });

    return { dataSource, totalHoursByDate };
  };

  const sortedTasks = sortTasksById(data.reduce((acc, item) => acc.concat(item.tasks), []));

  const uniqueDates = getUniqueDates(sortedTasks);
  const { dataSource, totalHoursByDate } = createDataSource(sortedTasks, uniqueDates);

  const columns = [
    {
      title: "Название задачи",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ответственные",
      dataIndex: "responsible",
      key: "responsible",
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
        const hours = distribution[date];
        const formattedHours = hours ? `${Math.floor(hours)} ч.` : "";
        return formattedHours;
      },
    })),
  ];

  return (
    <Table
      scroll={{ x: "max-content" }}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      bordered
      title={() => `${userName}`}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell colSpan={5}>Общее количество часов</Table.Summary.Cell>
          {uniqueDates.map((date) => (
            <Table.Summary.Cell key={date}>{totalHoursByDate[date] ? `${totalHoursByDate[date]} ч.` : ""}</Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      )}
    />
  );
};

export default HoursComponent;
