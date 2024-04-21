import React from "react";
import { Layout } from "antd";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { fetchUserId, getCurrentRole, getRoleByBoardId, getRoles } from "../../api";
import RoleCard from "./RoleCard";

const Roles = () => {
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

  const { data: roles = [] } = useQuery(["roles"], () => getRoles());
  const queryClient = useQueryClient();

  console.log(currentRole);
  return (
    <Layout>
      <div style={{ margin: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {roles
          .sort((a, b) => a - b)
          .map((role) => (
            <div key={role.id}>
              <RoleCard role={role} currentRole={currentRole} isOwner={isOwner} userId={userId}></RoleCard>
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default Roles;
