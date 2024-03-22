import axios from "axios";
import io from "socket.io-client";
// const BASE_URL = "http://31.129.107.236:5000"; // Базовый URL API
const BASE_URL = "http://localhost:5000"; // Базовый URL API

export default class SocketApi {
  static socket;

  static createConnection() {
    this.socket = io("http://localhost:5000");

    this.socket.on("connect", () => {
      console.log("connected");
    });

    this.socket.on("disconnect", (e) => {
      console.log("disconnected");
    });
  }
}
export async function login(data) {
  const response = await axios.post(`${BASE_URL}/auth/login`, data);

  const token = response.data.token;
  localStorage.setItem("token", token);
}
export async function registration(data) {
  await axios.post(`${BASE_URL}/auth/registration`, data);
}
export const fetchUsersByBoard = async (boardId) => {
  const response = await axios.get(`${BASE_URL}/users/byBoardId/${boardId}`);
  return response.data;
};
export async function addUserInBoard(userId, boardId) {
  await axios.post(`${BASE_URL}/users/${userId}/boards/${boardId}`);
}
export async function AddBoard(data, userId) {
  const response = await axios.post(`${BASE_URL}/users/${userId}/boards`, data);

  return response.data;
}

export async function addState(data, userId, boardId) {
  const response = await axios.post(`${BASE_URL}/users/${userId}/boards/${boardId}/states`, data);
  return response.data;
}

export async function addTask(data, userId, boardId, stateId) {
  const response = await axios.post(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks`, data);

  return response.data;
}
export async function commentTask(data, userId, boardId, stateId, taskId) {
  const response = await axios.post(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/comment`, data);

  return response.data;
}
export async function getCommentsTask(userId, boardId, stateId, taskId) {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/comment`);

  return response.data;
}
export async function deleteTask(userId, boardId, stateId, taskId) {
  await axios.delete(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}`);
}
export async function deleteState(userId, boardId, stateId) {
  await axios.delete(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}`);
}

export async function deleteBoard(userId, boardId) {
  await axios.delete(`${BASE_URL}/users/${userId}/boards/${boardId}`);
}
export async function taskChangeArchivingStatus(userId, boardId, stateId, taskId, isArchived) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/archive`, { isArchived: isArchived });
}
export async function updateTask(userId, boardId, stateId, taskId, newState) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}`, { newStateId: newState });
}
export async function updateTaskIsCompleted(userId, boardId, stateId, taskId, updatedIsCompleted) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/isCompleted`, updatedIsCompleted);
}

export async function updateTaskTitle(userId, boardId, stateId, taskId, data) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}`, { newStateId: newState, newOrder: newOrderNum });
}

export async function updateBoard(userId, boardId, updatedData) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}`, updatedData);
}
export const fetchBoards = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards`);

  return response.data;
};

export const fetchBoardById = async (userId, boardId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}`);
  return response.data;
};

export const fetchStates = async (userId, boardId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/states`);

  return response.data.sort((a, b) => a.id - b.id);
};
export const getIsArchivedTasks = async (userId, boardId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/tasks`);
  return response.data;
};
export async function fetchUserId() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`${BASE_URL}/users/currentUser`, {
    headers,
  });

  return response.data.id;
}

export async function fetchUser() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`${BASE_URL}/users/currentUser`, {
    headers,
  });
  return response.data;
}
export const getRoleByBoardId = async (userId, boardId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/roleByBoardId/${boardId}`);
  return response.data;
};
export const getCurrentRole = async (userId, boardId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/roleOnBoard/${boardId}`);

  return response.data;
};
export const updateRoleByBoardId = async (userId, boardId, updatedData) => {
  const response = await axios.put(`${BASE_URL}/users/${userId}/roleByBoardId/${boardId}`, { newPrivilege: updatedData });
  return response.data;
};

export const getRoles = async (boardId) => {
  const response = await axios.get(`${BASE_URL}/boards/${boardId}/roles`);

  return response.data;
};

export const getRole = async (boardId, roleId) => {
  const response = await axios.get(`${BASE_URL}/boards/${boardId}/roles/${roleId}`);
  return response.data;
};
export async function createRole(data, boardId) {
  console.log(data);
  await axios.post(`${BASE_URL}/boards/${boardId}/roles`, data);
}
export async function updateRole(userId, boardId, updatedData) {
  await axios.put(`${BASE_URL}/users/${userId}/roleOnBoard/${boardId}`, updatedData);
}
export const getTasks = async (userId, boardId, stateId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks`);

  return response.data;
};
export const getTask = async (userId, boardId, stateId, taskId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}`);

  return response.data;
};
export const getPriorities = async (boardId) => {
  const response = await axios.get(`${BASE_URL}/boards/${boardId}/priorities`);

  return response.data;
};
export const getPriority = async (boardId, priorityId) => {
  const response = await axios.get(`${BASE_URL}/boards/${boardId}/priorities/${priorityId}`);
  return response.data;
};
export async function createPriority(data, boardId) {
  await axios.post(`${BASE_URL}/boards/${boardId}/priorities`, data);
}

export const moveTaskToState = async (userId, boardId, stateId, taskId, newColumnId, newPosition) => {
  const response = await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/move`, {
    newColumnId,
    newPosition,
  });

  return response.data;
};

export const updateBoardWithColumns = async (userId, boardId, newColumns) => {
  const response = await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/update`, { newColumns });
  return response.data;
};
export const updateStateTitle = async (userId, boardId, stateId, newTitle) => {
  const response = await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}`, { title: newTitle });
  return response.data;
};
