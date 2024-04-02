import React from "react";
import { Table } from "antd";
import moment from "moment";
import "./GanttChart.css";
import { CheckCircleTwoTone } from "@ant-design/icons";

const GanttChart = ({ data }) => {
  const allTasks = data?.reduce((accumulator, state) => {
    return accumulator.concat(state.tasks);
  }, []);

  const allDates = allTasks?.reduce((dates, task) => {
    const startDate = moment(task.startDate);
    const endDate = task.endDate ? moment(task.endDate) : startDate;
    let currentDate = moment(startDate);
    console.log(task.startDate);
    while (currentDate <= endDate) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate.add(1, "days");
    }

    return dates;
  }, []);

  const uniqueDates = [...new Set(allDates)].sort(); // Sorting dates directly

  const columns = [
    {
      title: "Название задачи",
      dataIndex: "taskTitle",
      fixed: "left",
    },
    {
      title: "Статус",
      dataIndex: "state",
      key: "state",
      fixed: "left",
    },
    {
      title: "Начало",
      dataIndex: "startDate",
      key: "startDate",
      fixed: "left",
      defaultSortOrder: "descend",
      sorter: (a, b) => moment(a.startDate).valueOf() - moment(b.startDate).valueOf(),
    },
    {
      title: "Конец",
      dataIndex: "endDate",
      key: "endDate",
      fixed: "left",
      defaultSortOrder: "descend",
      sorter: (a, b) => moment(a.endDate).valueOf() - moment(b.endDate).valueOf(),
    },
    ...uniqueDates.map((date) => {
      return {
        title: date,
        dataIndex: date,
        key: date,
        render: (text, record) => {
          const isTaskDate = record[date];
          const isCompleted = record.isCompleted || false;
          return {
            children: isCompleted && isTaskDate ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : null,
            props: {
              style: {
                background: isTaskDate ? (isCompleted ? "lightgreen" : "lightblue") : "transparent",
              },
            },
          };
        },
        className: "no-border-right", // Добавляем класс для стилизации столбца
      };
    }),
  ];

  const dataSource = data?.reduce((result, state) => {
    const tasks = state.tasks.reduce((acc, task) => {
      if (!task.isArchived) {
        const taskData = {
          key: task.id,
          taskTitle: task.title,
          state: state.title,
          startDate: moment(task.startDate).locale("ru").format("DD.MM.YYYY, HH:mm:ss"),
          endDate: moment(task.endDate).locale("ru").format("DD.MM.YYYY, HH:mm:ss"),
          isCompleted: task.isCompleted || false, // Include isCompleted property in task data
        };

        uniqueDates.forEach((date) => {
          const isTaskDate =
            task.startDate &&
            moment(task.startDate).startOf("day") <= moment(date).startOf("day") &&
            (!task.endDate || moment(task.endDate).startOf("day") >= moment(date).startOf("day"));
          taskData[date] = isTaskDate;
        });

        acc.push(taskData);
      }

      return acc;
    }, []);

    result.push(...tasks);

    return result;
  }, []);

  return (
    <div style={{ overflowX: "auto" }}>
      <Table columns={columns} dataSource={dataSource} bordered pagination={false} scroll={{ x: "max-content" }} />
    </div>
  );
};

export default GanttChart;
