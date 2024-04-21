import axios from "axios";
import io from "socket.io-client";
// const BASE_URL = "http://31.129.97.240:5000"; // Базовый URL API
export const BASE_URL = "http://localhost:5000"; // Базовый URL API

export default class SocketApi {
  static socket;

  static createConnection() {
    this.socket = io(BASE_URL);

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

export async function deleteUserFromBoard(userId, boardId) {
  try {
    await axios.delete(`${BASE_URL}/users/${userId}/boards/${boardId}/deleteUser`);
  } catch (error) {
    console.error("Failed to remove user from the board:", error.message);
    // Handle error as needed
  }
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
export async function addSubTask(userId, boardId, stateId, taskId, data) {
  console.log(data);
  const response = await axios.post(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/subtasks`, data);
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
export async function updateTask(userId, boardId, stateId, taskId, updatedData) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}`, updatedData);
}
export async function updateTaskIsCompleted(userId, boardId, stateId, taskId, updatedIsCompleted) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/isCompleted`, updatedIsCompleted);
}
export async function updateSubTaskIsCompleted(userId, boardId, stateId, taskId, subTaskId, updatedIsCompleted) {
  console.log(userId, boardId, stateId, taskId, subTaskId, updatedIsCompleted);
  await axios.put(
    `${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/subtasks/${subTaskId}/isCompleted`,
    updatedIsCompleted
  );
}

export async function updateTaskUsers(userId, boardId, stateId, taskId, isResponsible) {
  await axios.put(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/users`, { isResponsible: isResponsible });
}
//TODO добавить удаление ответственных и добавить уведомления при редактировании ответственных
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

export const getSubTasks = async (userId, boardId, stateId, taskId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/boards/${boardId}/states/${stateId}/tasks/${taskId}/subtasks`);
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

  if (!response.data) {
    const defaultRole = {
      name: "Гость",
      canCreateRole: false,
      canEditRole: false,
      canAccessArchive: false,
      canCreatePriorities: false,
      canAddColumns: false,
      canAddTasks: false,
      canInviteUsers: false,
    };
    return defaultRole;
  }
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
  await axios.post(`${BASE_URL}/boards/${boardId}/roles`, data);
}

export async function deleteRole(boardId, roleId) {
  await axios.delete(`${BASE_URL}/boards/${boardId}/roles/${roleId}`);
}

export async function changeRole(boardId, roleId, updatedData) {
  try {
    const response = await axios.put(`${BASE_URL}/boards/${boardId}/roles/${roleId}`, updatedData);
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при обновлении роли: ${error.message}`);
  }
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

export const fetchUserByEmail = async (email) => {
  const response = await axios.get(`${BASE_URL}/users/byEmail?email=${email}`);

  return response.data;
};

export const getInvitations = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/invitations`);
  return response.data;
};
export const deleteNotification = async (userId, notificationId) => {
  const response = await axios.delete(`${BASE_URL}/users/${userId}/notifications/${notificationId}`); 
};
export const getNotificationsForBoard = async (userId, boardId) => {
  console.log({ boardId });
  const response = await axios.get(`${BASE_URL}/users/${userId}/notifications`, { params: { boardId: boardId } }); // Укажите boardId явно
  return response.data;
};
export const getNotificationsForUser = async (userId) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}/notifications/forUser`); // Укажите boardId явно
  return response.data;
};
export const markNotificationsAsRead = async (userId, notificationIds) => {
  console.log(userId, notificationIds);
  try {
    const response = await axios.post(`${BASE_URL}/users/${userId}/notifications/readNotif`, { notificationIds });
    console.log("Уведомления успешно отмечены как прочитанные", response.data);
    return response.data;
  } catch (error) {
    console.error("Произошла ошибка при отметке уведомлений как прочитанных", error);
    throw error;
  }
};
export const createInvitation = async (email, fromUserId, boardId, title, message) => {
  try {
    const user = await fetchUserByEmail(email);
    const userId = user.id;

    const response = await axios.post(`${BASE_URL}/users/${userId}/invitations`, { title, message, userId, boardId, fromUserId });

    return response.data;
  } catch (error) {
    console.error(`Error deleting notification: ${error.message}`);
    throw error;
  }
};
export const createNotificationForBoard = async (title, message, userId, boardId, taskId) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/${userId}/notifications`, { title, message, userId, boardId, taskId });
    return response.data;
  } catch (error) {
    console.error(`Error deleting notification: ${error.message}`);
    throw error;
  }
};
export const deleteInvitations = async (userId, notificationId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${userId}/invitations/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting notification: ${error.message}`);
    throw error;
  }
};

export const fetchFiles = async (taskId) => {
  const response = await axios.get(`${BASE_URL}/files/${taskId}`);
  console.log(response.data);
  return response.data;
};

export const uploadFile = async (file, taskId) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${BASE_URL}/files/upload/${taskId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteFile = async (file) => {
  try {
    await axios.delete(`${BASE_URL}/files/delete/${file.id}`, { data: file });
  } catch (error) {
    throw error;
  }
};
export const checkAccessibility = (boardId, user) => {
  console.log(boardId, user?.boards);

  if (user?.boards.some((board) => board.id.toString() === boardId)) return true;
  return false;
};
