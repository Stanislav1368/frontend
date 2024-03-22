import { Collapse, Drawer, List, Tag, Typography } from "antd";
import React, { useState } from "react";

const RoleCard = ({ role }) => {
  const [showRights, setShowRights] = useState(false);

  const toggleRights = () => {
    setShowRights(!showRights);
  };

  return (
    <Collapse
      style={{ maxWidth: "600px" }}
      collapsible="header"
      items={[
        {
          key: "1",
          label: `${role.name}`,
          children: (
            <List>
            <List.Item>
              <Typography.Text strong>Возможность редактировать информацию доски:</Typography.Text>
              {role.canEditBoardInfo ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Возможность добавлять колонки:</Typography.Text>
              {role.canAddColumns ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Возможность добавлять пользователей:</Typography.Text>
              {role.canAddUsers ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Возможность добавлять приоритеты:</Typography.Text>
              {role.canAddPriorities ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Возможность создавать роли:</Typography.Text>
              {role.canCreateRoles ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Доступ к статистике:</Typography.Text>
              {role.canAccessStatistics ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Создание отчетов:</Typography.Text>
              {role.canCreateReports ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
            <List.Item>
              <Typography.Text strong>Доступ к архиву:</Typography.Text>
              {role.canAccessArchive ? <Tag color="success">Да</Tag> : <Tag color="error">Нет</Tag>}
            </List.Item>
          </List>
          ),
        },
      ]}
    />
    // <div
    //   key={role.id}
    //   style={{
    //     backgroundColor: "white",
    //     borderRadius: "8px",
    //     padding: "16px",
    //     border: "1px solid lightgray",
    //     display: "block",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    //     maxWidth: "600px",
    //   }}>
    //   <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    //     <h3 style={{ width: "200px", wordWrap: "break-word" }}>
    //       <span>{role.name}</span>
    //     </h3>
    //   </div>

    // </div>
  );
};

export default RoleCard;
