import React, { useEffect, useState } from "react";
import { Button, ColorPicker, Divider, Form, Input, Layout, Menu, Modal, Space, Tag, Spin } from "antd";
import { useQuery } from "react-query";
const { Sider } = Layout;
import { useMutation, useQueryClient } from "react-query";
import ArchiveIcon from "@mui/icons-material/Archive";

import SocketApi, {
  addState,
  checkAccessibility,
  createPriority,
  fetchBoardById,
  fetchStates,
  fetchUser,
  fetchUserId,
  fetchUsersByBoard,
  getCurrentRole,
  getPriorities,
  getRoleByBoardId,
  updateBoardWithColumns,
} from "../../api";
// import "../Boards/Boards.css";
import { BrowserRouter, Link, Route, Routes, useParams, Navigate } from "react-router-dom";
import { AccountTreeOutlined, HistoryOutlined, SecurityOutlined, ViewKanbanOutlined } from "@mui/icons-material";
import Archive from "../Archive/Archive";
import GanttChart from "../GanttChart/GanttChart";
import KanbanLayout from "./Components/KanbanLayout";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";
import Users from "../BoardUsers/Users";
import Roles from "../BoardRoles/Roles";
import { Content } from "antd/es/layout/layout";
import { TeamOutlined } from "@ant-design/icons";
import History from "../History/History";
import NotFoundPage from "../NotFoundPage/NotFoundPage";
import HoursTask from "../HoursTask/HoursTask";

const Board = () => {
  const queryClient = useQueryClient();
  const [colorHex, setColorHex] = useState("#1677ff");
  const [formatHex, setFormatHex] = useState("hex");

  const hexString = React.useMemo(() => (typeof colorHex === "string" ? colorHex : colorHex?.toHexString()), [colorHex]);
  const { boardId } = useParams();
  const { data: userId } = useQuery("userId", fetchUserId, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser, {
    enabled: !!userId,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
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
  const { data: board, isLoading: isBoardLoading } = useQuery("board", () => fetchBoardById(userId, boardId), { enabled: !!userId });
  const CreatePriorityMutation = useMutation((data) => createPriority(data, board.id), {
    onSuccess: () => queryClient.invalidateQueries(["priorities"]),
  });

  const createPriorityForBoard = async (values) => {
    try {
      values.color = hexString;

      CreatePriorityMutation.mutate(values);
      // setOpenAddPriorityModal(false);
    } catch (error) {
      console.error(error);
    }
  };
  const { data: columns } = useQuery(["columns", userId, board?.id], () => fetchStates(userId, boardId), {
    enabled: !!userId,
  });

  const [form] = Form.useForm();

  useEffect(() => {
    SocketApi.createConnection();
    SocketApi.socket.on("newState", () => {
      queryClient.invalidateQueries(["columns"]);
    });
    SocketApi.socket.on("deleteState", () => {
      queryClient.invalidateQueries(["columns"]);
    });
    return () => {
      SocketApi.socket.off("deleteState");
    };
  }, []);
  const updateColumns = (newColumns) => {
    queryClient.setQueryData(["columns", userId, board?.id], Object.values(newColumns));

    updateBoardWithColumns(userId, board?.id, newColumns); // Обновляем данные через API
  };

  const { data: usersBoard } = useQuery(["users", board?.id], () => fetchUsersByBoard(boardId));
  const { data: priorities } = useQuery(["priorities", board?.id], () => getPriorities(boardId));
  console.log(usersBoard)
  const [openAddSectionModal, setOpenAddSectionModal] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openAddPriorityModal, setOpenAddPriorityModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
  };
  const onCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  const handleAddState = async (values) => {
    console.log(values)
    try {
      setOpenAddSectionModal(false);
      const newColumn = await addState(values, userId, board.id);
      queryClient.setQueryData(["columns", userId, board.id], (prevColumns) => [...prevColumns, newColumn]);
    } catch (error) {
      console.error(error);
    }
  };
  const [openTaskModal, setOpenTaskModal] = useState(false);

  const hasAccess = user && checkAccess(parseInt(boardId), user.boards);
  // if (!user) {
  //   return (

  //   );
  // }
  console.log(columns);

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={true} />
        {!user ? (
          <Layout style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Spin size="large" />
            Загрузка...
          </Layout>
        ) : (
          <>
            {hasAccess ? (
              <Layout>
                <Sider breakpoint="lg" collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light">
                  <div className="logo" />
                  <Menu theme="light" mode="inline">
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<ViewKanbanOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/`}> Канбан доска</Link>
                    </Menu.Item>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<HistoryOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/history`}>История</Link>
                    </Menu.Item>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<AccountTreeOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/gant`}>Гант</Link>
                    </Menu.Item>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<AccountTreeOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/hoursTask`}>Распределении часов на задачи</Link>
                    </Menu.Item>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<ArchiveIcon style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/archive`}>Архив</Link>
                    </Menu.Item>
                    <Divider style={{ margin: "8px 0px 8px 0px" }}></Divider>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<TeamOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/users`}>Пользователи</Link>
                    </Menu.Item>
                    <Menu.Item style={{ padding: "0px 16px 0px 16px" }} icon={<SecurityOutlined style={{ fontSize: "18px" }} />}>
                      <Link to={`/boards/${boardId}/roles`}>Роли</Link>
                    </Menu.Item>
                  </Menu>
                </Sider>
                <Layout>
                  <Content>
                    <Routes>
                      <Route
                        path="/"
                        index
                        element={
                          <KanbanLayout
                            boardId={boardId}
                            board={board}
                            usersBoard={usersBoard}
                            columns={columns}
                            updateColumns={updateColumns}
                            userId={userId}
                            priorities={priorities}
                            openAddSectionModal={openAddSectionModal}
                            setOpenAddSectionModal={setOpenAddSectionModal}
                            openAddPriorityModal={openAddPriorityModal}
                            setOpenAddPriorityModal={setOpenAddPriorityModal}
                          />
                        }
                      />
                      <Route path="/gant" element={<GanttChart data={columns} />} />
                      <Route path="/hoursTask" element={<HoursTask data={columns} userId={userId} />} />
                      <Route path="/archive" element={<Archive boardId={boardId} />} />
                      <Route path="/users" element={<Users userId={userId} boardId={boardId} />} />
                      <Route path="/roles" element={<Roles userId={userId} boardId={boardId} />} />
                      <Route path="/history" element={<History />} />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            ) : (
              <NotFoundPage />
            )}
          </>
        )}
      </Layout>

      <Modal footer={null} title="Новый столбец" open={openAddSectionModal} onCancel={() => setOpenAddSectionModal(false)}>
        <Form form={form} onFinish={handleAddState}>
          <Form.Item name="title" rules={[{ required: true, message: "Введите название!" }]}>
            <Input required placeholder="Заголовок" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Добавить столбец
              </Button>
              <Button onClick={() => setOpenAddSectionModal(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        footer={null}
        title="Новая метка"
        open={openAddPriorityModal}
        onOk={() => setOpenAddPriorityModal(false)}
        onCancel={() => setOpenAddPriorityModal(false)}>
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gridGap: "10px",
              margin: "10px 0",
            }}>
            {priorities?.map((priority) => (
              <Tag key={`${priority?.id}`} color={`${priority?.color}`}>
                {`${priority?.name}`}
              </Tag>
            ))}
          </div>

          <Form form={form} onFinish={createPriorityForBoard} initialValues={{ color: "#8d2d1d" }}>
            <Form.Item name="name" label="Наименование" rules={[{ required: true, message: "Пожалуйста, введите наименование!" }]}>
              <Input />
            </Form.Item>

            <Form.Item name="color" label="Цвет">
              <ColorPicker format={formatHex} value={colorHex} onChange={setColorHex} onFormatChange={setFormatHex} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Создать приоритет
                </Button>
                <Button onClick={() => setOpenAddPriorityModal(false)}>Отмена</Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      </Modal>
    </>
  );
};

export default Board;
function checkAccess(boardId, userBoards) {
  console.log(boardId, userBoards);
  return userBoards.some((board) => board.id === boardId);
}
