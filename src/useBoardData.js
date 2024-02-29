import { useQuery } from "react-query";
import { fetchBoardById, fetchStates, fetchUserId, fetchUsersByBoard, getPriorities, getRoleByBoardId, getCurrentRole } from "./api";
import { useParams } from "react-router-dom";

const useBoardData = (boardId) => {
  // const { boardId } = useParams();

  const { data: userId, isLoading: isUserIdLoading } = useQuery("userId", fetchUserId, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: users, isLoading: isUsersLoading } = useQuery(["usersBoard", boardId], () => fetchUsersByBoard(boardId));
  const { data: board, isLoading: isBoardLoading } = useQuery("board", () => fetchBoardById(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: priorities, isLoading: isPrioritiesLoading } = useQuery("priorities", () => getPriorities(boardId), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: states, isLoading: isStatesLoading } = useQuery("states", () => fetchStates(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: isOwner, isLoading: isRoleLoading } = useQuery("isOwner", () => getRoleByBoardId(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: currentRole, isLoading: isCurrentRoleLoading } = useQuery("currentRole", () => getCurrentRole(userId, boardId), {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  return {
    boardId,
    board,
    currentRole,
    isOwner,
    userId,
    priorities,
    users,
    states,
    isLoading: isUserIdLoading || isUsersLoading || isBoardLoading || isPrioritiesLoading || isStatesLoading || isRoleLoading || isCurrentRoleLoading,
  };
};

export default useBoardData;