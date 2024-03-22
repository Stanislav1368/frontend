import moment from "moment";
import React from "react";

const GanttChart = ({ data }) => {
  const allTasks = data?.reduce((accumulator, state) => {
    return accumulator.concat(state.tasks);
  }, []);

  const allDates = allTasks?.reduce((dates, task) => {
    const startDate = new Date(task.startDate);
    const endDate = task.endDate ? new Date(task.endDate) : startDate;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, []);

  const uniqueDates = [...new Set(allDates)];
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        {/* <div style={{ display: "flex", alignItems: "center" }}>
          {uniqueDates.map((date, index) => (
            <div key={index} style={{ textAlign: "center", minWidth: `${100 / uniqueDates.length}%`, borderRight: "1px solid #ccc" }}>
              {new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
            </div>
          ))}
        </div> */}
        <table style={{ borderSpacing: "0" }}>
          <thead>
            <tr>
              <th>Название задачи</th>
              {uniqueDates.map((date, index) => (
                <th key={index}>{new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((state, stateIndex) => (
              <React.Fragment key={stateIndex}>
                <tr>
                  <th colSpan={uniqueDates.length + 1}>{state.title}</th>
                </tr>
                {state.tasks.map((task, taskIndex) => (
                  <tr key={taskIndex}>
                    <td>{task.title}</td>
                    {uniqueDates.map((date, dateIndex) => {
                      return task.startDate && moment.utc(task.startDate).startOf('day') <= moment.utc(date).startOf('day') && (!task.endDate || moment.utc(task.endDate).startOf('day') >= moment.utc(date).startOf('day')) ? (
                        <td key={dateIndex} style={{ background: "lightblue" }}></td>
                      ) : (
                        <td key={dateIndex}></td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GanttChart;
