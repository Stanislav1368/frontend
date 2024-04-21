import { Button, Checkbox, Collapse, Divider, Drawer, Flex, Form, List, Modal, Tag, Typography, message } from "antd";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { changeRole, fetchUserId, getCurrentRole, getRoleByBoardId } from "../../api";
import { useParams } from "react-router-dom";

const RoleCard = ({ role, currentRole, isOwner, userId }) => {
  const queryClient = useQueryClient();
  const { boardId } = useParams();

  return (
    <Collapse
      style={{ maxWidth: "600px" }}
      collapsible="header"
    >
      <Collapse.Panel
        key={role.id}
        header={<Flex style={{ alignItems: "center", justifyContent: "space-between" }}>{role.name}</Flex>}
      >
        <span>{role.description}</span>
      </Collapse.Panel>
    </Collapse>
  );
};

export default RoleCard;
