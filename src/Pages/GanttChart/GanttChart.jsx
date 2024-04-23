import React from "react";
import { Table } from "antd";
import moment from "moment";
import "./GanttChart.css";

const GanttChart = ({ data }) => {
  // Получаем все задачи
  const allTasks = data?.reduce((accumulator, state) => accumulator.concat(state.tasks), []);

  // Получаем все даты
  const latestActualEndDate = allTasks?.reduce((latestDate, task) => {
    if (task.actualEndDate && moment(task.actualEndDate).isAfter(latestDate)) {
      return moment(task.actualEndDate);
    }
    return latestDate;
  }, moment("1970-01-01")); // Используем начальное значение

  const allDates = allTasks?.reduce((dates, task) => {
    const startDate = moment(task.startDate);
    const endDate = task.endDate ? moment(task.endDate) : startDate;
    let currentDate = moment(startDate);
    while (currentDate <= endDate || currentDate <= latestActualEndDate) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate.add(1, "days");
    }
    return dates;
  }, []);

  const uniqueDates = [...new Set(allDates)].sort();

  // Создаем столбцы таблицы
  const columns = [
    {
      title: "Название задачи",
      dataIndex: "taskTitle",
      fixed: "left",
      width: 120,
    },
    {
      title: "Столбец",
      dataIndex: "state",
      key: "state",
      fixed: "left",
      width: 90,
    },
    {
      title: "Начало",
      dataIndex: "startDate",
      key: "startDate",
      fixed: "left",
      defaultSortOrder: "descend",
      sorter: (a, b) => moment(a.startDate).valueOf() - moment(b.startDate).valueOf(),
      width: 90,
    },
    {
      title: "Конец",
      dataIndex: "endDate",
      key: "endDate",
      fixed: "left",
      defaultSortOrder: "descend",
      sorter: (a, b) => moment(a.endDate).valueOf() - moment(b.endDate).valueOf(),
      width: 90,
    },
    {
      title: "Родительская задача",
      dataIndex: "dependentTask",
      key: "dependentTask",
      fixed: "left",
      width: 90,
    },
    {
      title: "Фактическая дата завершения",
      dataIndex: "actualEndDate",
      key: "actualEndDate",
      fixed: "left",
      width: 90,
    },
    ...uniqueDates.map((date) => {
      return {
        title: moment(date).format("DD.MM.YYYY"),
        dataIndex: date,
        key: date,
        render: (text, record) => {
          const isTaskDate = record[date];
          console.log(record);
          let backgroundColor = "transparent";
          console.log(moment(date).format("DD.MM.YYYY, HH.mm.ss"));
          if (record.actualEndDate <= record.endDate && isTaskDate) {
            backgroundColor = "#52c41a";
          } else if (
            record.endDate < record.actualEndDate &&
            moment(date).format("DD.MM.YYYY, HH.mm.ss") <= record.actualEndDate &&
            moment(date).format("DD.MM.YYYY, HH.mm.ss") > record.startDate
          ) {
            backgroundColor = "#f5222d";
            if (isTaskDate) {
              backgroundColor = "#52c41a";
            }
          } else if (isTaskDate) {
            backgroundColor = "lightblue"; // Серый цвет для остальных дат
            if (isTaskDate && record.isCompleted) {
              backgroundColor = "#52c41a";
            }
          }

          return {
            children: <div style={{maxHeight: "40px", minHeight: "40px"}}/>,
            props: {
              style: {
                background: backgroundColor,
              },
            },
          };
        },
        className: "no-border-right",
      };
    }),
  ];

  // Создаем источник данных для таблицы
  const dataSource = data?.reduce((result, state) => {
    const tasks = state.tasks.reduce((acc, task) => {
      if (!task.isArchived) {
        const taskData = {
          key: task.id,
          taskTitle: task.title,
          state: state.title,
          startDate: moment(task.startDate).locale("ru").format("DD.MM.YYYY"),
          endDate: moment(task.endDate).locale("ru").format("DD.MM.YYYY"),
          actualEndDate: task.actualEndDate && moment(task.actualEndDate).locale("ru").format("DD.MM.YYYY, HH:mm:ss"),
          isCompleted: task.isCompleted || false,
          dependentTask: task?.dependentTask?.title,
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

  // Отображаем компонент
  return (
    <div style={{ overflowX: "auto" }}>
      <Table columns={columns} dataSource={dataSource} bordered pagination={false} scroll={{ x: "max-content" }} />
    </div>
  );
};
export default GanttChart;
