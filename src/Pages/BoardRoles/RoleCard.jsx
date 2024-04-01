import { Button, Checkbox, Collapse, Divider, Drawer, Flex, Form, List, Modal, Tag, Typography, message } from "antd";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { changeRole, deleteRole, fetchUserId, getCurrentRole, getRoleByBoardId } from "../../api";
import { useParams } from "react-router-dom";

const RoleCard = ({ role }) => {
  const queryClient = useQueryClient();
  const { boardId } = useParams();
  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId);
  const { data: currentRole, isLoading: currentRoleLoading } = useQuery("currentRole", () => getCurrentRole(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: isOwner, isLoading: ownerLoading } = useQuery("isOwner", () => getRoleByBoardId(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const changeRoleMutation = useMutation((updatedRole) => changeRole(boardId, role.id, updatedRole), {
    onSuccess: () => {
      queryClient.invalidateQueries(["roles"]);
    },
  });

  const rights = [
    { title: "Создание ролей", key: "canCreateRole" },
    { title: "Управление пользователями", key: "canEditRole" },
    { title: "Доступ к архиву", key: "canAccessArchive" },
    { title: "Создание приоритетов", key: "canCreatePriorities" },
    { title: "Добавление колонок", key: "canAddColumns" },
    { title: "Добавление/перемещение задач", key: "canAddTasks" },
    { title: "Приглашение пользователей", key: "canInviteUsers" },
  ];

  const isGuestRole = role.name === "Гость";

  const handleCheckboxChange = (right) => {
    return () => {
      if (!isGuestRole) {
        const updatedRole = { ...role, [right.key]: !role[right.key] };
        changeRoleMutation.mutateAsync(updatedRole);
      }
    };
  };
  const handleDeleteRole = async (roleId) => {
    console.log(roleId);
    try {
      await deleteRole(boardId, roleId);
      queryClient.invalidateQueries(["roles"]);
      message.success("Роль удалена");
    } catch (error) {
      message.error(`Произошла ошибка при удалении роли`);
    }
  };

  return (
    <>
      <Collapse
        style={{ maxWidth: "600px" }}
        collapsible="header"
        items={[
          {
            key: `${role.id}`,
            label: (
              <Flex style={{ alignItems: "center", justifyContent: "space-between" }}>
                {role.name}
                {(currentRole?.canCreateRole || isOwner) && !isGuestRole && (
                  <Button danger onClick={(e) => {handleDeleteRole(role.id), e.stopPropagation()}}>
                    Удалить
                  </Button>
                )}
              </Flex>
            ),
            children: rights.map((right, index) => (
              <List.Item key={index}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography.Text strong>{right.title}:</Typography.Text>
                  <Tag style={{ width: "35px", display: "flex", justifyContent: "center" }} color={role[right.key] ? "success" : "error"}>
                    <Checkbox checked={role[right.key]} onChange={handleCheckboxChange(right)} disabled={isGuestRole}></Checkbox>
                  </Tag>
                </div>
                <Divider style={{ height: "0px", margin: "5px 0px 5px 0px" }}></Divider>
              </List.Item>
            )),
          },
        ]}
      />
    </>
  );
};

export default RoleCard;
