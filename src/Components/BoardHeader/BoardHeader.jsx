import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ArchiveIcon from "@mui/icons-material/Archive";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { addState, addUserInBoard, createPriority, createRole, deleteBoard, fetchUsersByBoard, getRoles, updateBoard, updateRole } from "../../api";
import MyModal from "../MyModal/MyModal";
import Notification from "../Notification";
import Dropdown from "../Dropdown/Dropdown";
import Button from "../Button/Button";
import { CheckBox, DisabledByDefault } from "@mui/icons-material";
import "./BoardHeader.css";

const BoardHeader = ({ board, isOwner, userId, priorities, currentRole, boardId, onBoardDelete, handleChangeBoardTitle }) => {
  const { data: roles, isLoading: isRolesLoading } = useQuery("roles", () => getRoles(board.id), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const russianPrivileges = [
    "Изменение информации о доске",
    "Добавление колонок",
    "Добавление пользователей",
    "Добавление приоритетов",
    "Создание ролей",
    "Доступ к статистике",
    "Создание отчетов",
    "Доступ к архиву",
  ];

  // Пример соответствия английских и русскоязычных названий прав
  const privilegesMap = {
    canEditBoardInfo: "Изменение информации о доске",
    canAddColumns: "Добавление колонок",
    canAddUsers: "Добавление пользователей",
    canAddPriorities: "Добавление приоритетов",
    canCreateRoles: "Создание ролей",
    canAccessStatistics: "Доступ к статистике",
    canCreateReports: "Создание отчетов",
    canAccessArchive: "Доступ к архиву",
  };
  const privileges = [
    "canEditBoardInfo",

    "canAddColumns",

    "canAddUsers",

    "canAddPriorities",

    "canCreateRoles",

    "canAccessStatistics",

    "canCreateReports",

    "canAccessArchive",
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState();
  const queryClient = useQueryClient();

  const [selectedColor, setSelectedColor] = useState("#000000");

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
  };
  const [openAddSectionModal, setOpenAddSectionModal] = useState(false);
  const handleOpenAddSectionModal = () => {
    setOpenAddSectionModal(true);
  };
  const handleCloseAddSectionModal = () => {
    setOpenAddSectionModal(false);
  };
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const handleOpenAddUserModal = () => {
    setOpenAddUserModal(true);
  };
  const handleCloseAddUserModal = () => {
    setOpenAddUserModal(false);
  };
  const [openAccessSettingsModal, setOpenAccessSettingsModal] = useState(false);
  const handleOpenAccessSettingsModal = () => {
    setOpenAccessSettingsModal(true);
  };
  const handleCloseAccessSettingsModal = () => {
    setOpenAccessSettingsModal(false);
  };
  const [openRolesModal, setOpenRolesModal] = useState(false);
  const handleOpenRolesModal = () => {
    setOpenRolesModal(true);
  };
  const handleCloseRolesModal = () => {
    setOpenRolesModal(false);
  };
  const [openPriorityModal, setOpenPriorityModal] = useState(false);
  const handleOpenPriorityModal = () => {
    setOpenPriorityModal(true);
  };
  const handleClosePriorityModal = () => {
    setOpenPriorityModal(false);
  };
  const handleEditClick = () => {
    setIsEditing(true);
    setNewTitle(board.title);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    if (newTitle) {

      handleChangeBoardTitle(board.id, newTitle);
      updateBoardMutation.mutate(newTitle);
      setIsEditing(false);
    }
  };
  const updateBoardMutation = useMutation((newTitle) => updateBoard(userId, board.id, { title: newTitle }), {
    onSuccess: () => {
      queryClient.invalidateQueries("board");
    },
  });
  const { data: users, isLoading: isUsersLoading } = useQuery(["usersBoard", board.id], () => fetchUsersByBoard(board.id));
  const handleAddUserInBoard = async (event, boardId) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const userId = formData.get("userId");
      await addUserInBoard(userId, boardId);
      handleCloseAddUserModal();
      await queryClient.invalidateQueries(["usersBoard", boardId]);
      handleOpenNotifSuccessUser();
    } catch (error) {
      console.error(error);
      handleOpenNotifErrorUser();
    }
  };
  const [openNotifSuccessState, setOpenNotifSuccessState] = useState(false);
  const handleOpenNotifSuccessState = () => {
    setOpenNotifSuccessState(true);
    setTimeout(() => {
      setOpenNotifSuccessState(false);
    }, 2000);
  };
  const [openNotifSuccessTask, setOpenNotifSuccessTask] = useState(false);
  const handleOpenNotifSuccessTask = () => {
    setOpenNotifSuccessTask(true);
    setTimeout(() => {
      setOpenNotifSuccessTask(false);
    }, 2000);
  };
  const [openNotifSuccessUser, setOpenNotifSuccessUser] = useState(false);
  const handleOpenNotifSuccessUser = () => {
    setOpenNotifSuccessUser(true);
    setTimeout(() => {
      setOpenNotifSuccessUser(false);
    }, 2000);
  };

  const [openNotifErrorUser, setOpenNotifErrorUser] = useState(false);
  const handleOpenNotifErrorUser = () => {
    setOpenNotifErrorUser(true);
    setTimeout(() => {
      setOpenNotifErrorUser(false);
    }, 2000);
  };
  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };
  const handleAddState = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const fields = Object.fromEntries(formData);
      handleCloseAddSectionModal();
      handleOpenNotifSuccessState();
      AddStateMutation.mutate(fields);
    } catch (error) {
      console.error(error);
    }
  };
  const createPriorityForBoard = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const fields = Object.fromEntries(formData);

      handleClosePriorityModal();

      CreatePriorityMutation.mutate(fields);
    } catch (error) {
      console.error(error);
    }
  };
  async function handleRoleChange(userId, roleId) {
    await updateRole(userId, board.id, { roleId });
    queryClient.invalidateQueries(["usersBoard", board.id]);
  }

  const CreatePriorityMutation = useMutation((data) => createPriority(data, board.id), {
    onSuccess: () => queryClient.invalidateQueries(["priorities"]),
  });
  const AddStateMutation = useMutation((data) => addState(data, userId, board.id), { onSuccess: () => queryClient.invalidateQueries(["states"]) });
  const CreateRoleMutation = useMutation((data) => createRole(data, board.id), { onSuccess: () => queryClient.invalidateQueries(["roles"]) });
  const createRoleForBoard = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const fields = Object.fromEntries(formData);

      fields.canEditBoardInfo = Boolean(fields.canEditBoardInfo);
      fields.canAddColumns = Boolean(fields.canAddColumns);
      fields.canAddUsers = Boolean(fields.canAddUsers);
      fields.canAddPriorities = Boolean(fields.canAddPriorities);
      fields.canCreateRoles = Boolean(fields.canCreateRoles);
      fields.canAccessStatistics = Boolean(fields.canAccessStatistics);
      fields.canCreateReports = Boolean(fields.canCreateReports);
      fields.canAccessArchive = Boolean(fields.canAccessArchive);

      handleCloseRolesModal();

      CreateRoleMutation.mutate(fields);
    } catch (error) {
      console.error(error);
    }
  };
  if (isRolesLoading || isUsersLoading) {
    return <div></div>;
  }

  return (
    <>
      <>
        <Notification status="success" open={openNotifSuccessState}>
          таблица успешно создана
        </Notification>
        <Notification status="success" open={openNotifSuccessTask}>
          Задача успешно добавлена
        </Notification>
        <Notification status="success" open={openNotifSuccessUser}>
          Новый пользователь успешно добавлен
        </Notification>
        <Notification status="error" open={openNotifErrorUser}>
          Ошибка! Пользователь не найден
        </Notification>
        <MyModal open={openAddSectionModal} onClose={handleCloseAddSectionModal} header="Новая секция">
          <form onSubmit={handleAddState}>
            <input required type="text" name="title" placeholder="Заголовок" />
            <button type="submit">Добавить секцию</button>
          </form>
        </MyModal>
        <MyModal open={openAddUserModal} onClose={handleCloseAddUserModal} header="Добавить пользователя">
          <form onSubmit={(event) => handleAddUserInBoard(event, board.id)} className="flex flex-col">
            <input required className="" type="text" name="userId" placeholder="userId" />
            <button type="submit" className="w-[50%] mt-3 self-end">
              Добавить пользователя
            </button>
          </form>
        </MyModal>
        <MyModal open={openPriorityModal} onClose={handleClosePriorityModal} header="Создать новый приоритет">
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gridGap: "5px" }}>
              {priorities.map((priority, index) => (
                <div
                  key={priority?.id}
                  style={{ borderColor: priority?.color, backgroundColor: priority?.color, fontSize: "12px", padding: "2px", borderRadius: "5px" }}>
                  {priority?.name}
                </div>
              ))}
            </div>
          </>

          <form onSubmit={(event) => createPriorityForBoard(event, board.id)} className=" space-y-3">
            <div>
              <input required className="w-[50%]" type="text" name="name" placeholder="Наименование" />
              <div>
                <label>Индекс приоритета от 1 до 99: </label>
                <input type="number" name="index" min="1" max="99" style={{ width: "40px", height: "20px", padding: "0px" }} />
              </div>
            </div>

            <div className="flex flex-row space-x-3">
              <input className="" type="color" name="color" value={selectedColor} onChange={handleColorChange} />
              <label>Цвет</label>
            </div>
            <button type="submit" className="w-[50%]">
              Создать приоритет
            </button>
          </form>
        </MyModal>
        <MyModal open={openRolesModal} onClose={handleCloseRolesModal} header="Роли">
          <form onSubmit={(event) => createRoleForBoard(event, board.id)}>
            <div className="w-96 pt-5 rounded-lg">
              <div className="mb-4">
                <input required type="text" name="name" placeholder="Название роли" className="border-gray-300 border w-full px-3 py-2 rounded" />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3">
                {privileges.map((privilege, index) => (
                  <div key={privilege.id} className="flex items-center">
                    <input
                      className="mr-2"
                      name={privilege}
                      type="checkbox"
                      onChange={(e) => {
                        const checked = e.target.checked;
                      }}
                    />
                    <label key={privilege.id}>{russianPrivileges[index]}</label>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block font-medium">Роли</label>
                {roles.map((role) => (
                  <div key={role.id}>
                    {role.name}
                    {/* <input disabled type="checkbox" checked={role.canEditBoardInfo}></input> */}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 rounded">
                  Создать роль
                </button>
              </div>
            </div>
          </form>
        </MyModal>
        <MyModal open={openAccessSettingsModal} onClose={handleCloseAccessSettingsModal} header="Права доступа">
          {users.map((user) => (
            <li key={user.id}>
              <span>
                {user.name} {user.isOwner && <strong>(Создатель)</strong>}
              </span>
              {!user.isOwner && (
                <select
                  value={user.roleId}
                  onChange={(e) => {
                    handleRoleChange(user.id, e.target.value);
                  }}>
                  <option value={0} selected>
                    Без роли
                  </option>
                  {roles.map((role, index) => (
                    <option key={index} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </li>
          ))}
        </MyModal>
      </>
      <div style={{ display: "flex", alignItems: "center" }}>
        {isEditing ? (
          <div>
            <input type="text" value={newTitle} onChange={handleTitleChange} />
            <CheckBox className="ok" onClick={() => handleSaveClick()}>
              Save
            </CheckBox>
            <DisabledByDefault className="close" onClick={handleCancelClick}></DisabledByDefault>
          </div>
        ) : (
          <>
            <h1>{board.title}</h1>
        
            {currentRole.canEditBoardInfo || (isOwner && <EditIcon onClick={handleEditClick} />)}
            {isOwner ? (
              <Dropdown>
                <p onClick={() => onBoardDelete(boardId)}>
                  <DeleteForeverIcon />
                  Удалить
                </p>
              </Dropdown>
            ) : null}
          </>
        )}

        <div style={{ display: "flex", gap: "2.5px" }}>
          {users
            .sort((a, b) => a.id - b.id)
            .map((user, index) => (
              <Avatar key={index} {...stringAvatar(user.firstName)} />
            ))}
        </div>
      </div>
      <div className="func-btn">
        {isOwner || currentRole.canAddColumns ? (
          <Button onClick={handleOpenAddSectionModal} icon={<ViewColumnIcon />} text="Добавить секцию" />
        ) : null}
        {isOwner || currentRole.canAddUsers ? (
          <Button onClick={handleOpenAddUserModal} icon={<PersonAddIcon />} text="Добавить пользователя" />
        ) : null}
        {isOwner || currentRole.canAddPriorities ? (
          <Button onClick={handleOpenPriorityModal} icon={<PriorityHighIcon />} text="Добавить приоритет" />
        ) : null}
        {isOwner || currentRole.canCreateRoles ? <Button onClick={handleOpenRolesModal} icon={<SettingsAccessibilityIcon />} text="Роли" /> : null}
        {isOwner ? <Button onClick={handleOpenAccessSettingsModal} icon={<SettingsAccessibilityIcon />} text="Настройки доступа" /> : null}
        {/* {isOwner || currentRole.canAccessStatistics ? (
          <Button
            onClick={() => {
              window.location.href = `/boards/${board.id}/archive`;
            }}
            icon={<ArchiveIcon />}
            text="Архив"
          />
        ) : null} */}
      </div>
    </>
  );
};

const BoardHeaderMemoized = React.memo(BoardHeader);

export default BoardHeaderMemoized;
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name[0][0] + name[1][0]}`,
  };
}
