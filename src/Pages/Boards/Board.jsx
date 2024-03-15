import React, { useEffect, useState } from "react";
import { Button, ColorPicker, Divider, Form, Input, Layout, Menu, Modal, Space, Spin, Tag } from "antd";
import { useQuery } from "react-query";
const { Sider, Content } = Layout;
import { useMutation, useQueryClient } from "react-query";
import ArchiveIcon from "@mui/icons-material/Archive";
import SocketApi, {
  AddBoard,
  addState,
  createPriority,
  deleteState,
  fetchBoardById,
  fetchStates,
  fetchUserId,
  fetchUsersByBoard,
  getPriorities,
  updateBoardWithColumns,
} from "../../api";
import "./Boards.css";
import { useParams } from "react-router-dom";
import { AccountTreeOutlined, Dashboard, ViewKanbanOutlined } from "@mui/icons-material";
import Archive from "./Archive";
import GanttChart from "./GanttChart";
import KanbanLayout from "./KanbanLayout";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";
import Users from "./Users";
import Roles from "./Roles";

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
  const { data: board, isLoading: isBoardLoading } = useQuery("boards", () => fetchBoardById(userId, boardId), { enabled: !!userId });
  const AddBoardMutation = useMutation((data) => AddBoard(data, user.id), {
    onSuccess: () => queryClient.invalidateQueries(["boards"]),
  });
  const CreatePriorityMutation = useMutation((data) => createPriority(data, board.id), {
    onSuccess: () => queryClient.invalidateQueries(["priorities"]),
  });
  const createPriorityForBoard = async (values) => {
    try {
      values.color = hexString;

      CreatePriorityMutation.mutate(values);
      setOpenAddPriorityModal(false);
    } catch (error) {
      console.error(error);
    }
  };
  const { data: columns, isLoading, error } = useQuery(["columns", userId, board?.id], () => fetchStates(userId, board?.id));

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

  const { data: usersBoard, isLoadingUsers, errorUsers } = useQuery(["users", board?.id], () => fetchUsersByBoard(board?.id));
  const { data: priorities } = useQuery(["priorities", board?.id], () => getPriorities(board?.id));

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
    try {
      setOpenAddSectionModal(false);
      const newColumn = await addState(values, userId, board.id);
      queryClient.setQueryData(["columns", userId, board.id], (prevColumns) => [...prevColumns, newColumn]);
    } catch (error) {
      console.error(error);
    }
  };

  const [openTaskModal, setOpenTaskModal] = useState(false);

  const DeleteStateMutation = useMutation((stateId) => deleteState(userId, board.id, stateId), {
    onSuccess: () => queryClient.invalidateQueries(["columns"]),
  });

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={true} />

        <Layout>
          <Sider breakpoint="lg" collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light">
            <div className="logo" />
            <Menu theme="light" defaultSelectedKeys={["1"]} mode="inline" selectedKeys={[selectedMenuItem]} onClick={handleMenuClick}>
              <Menu.Item style={{ padding: "0px 16px 0px 16px" }} key="1" icon={<ViewKanbanOutlined style={{ fontSize: "18px" }} />}>
                Канбан доска
              </Menu.Item>
              <Menu.Item style={{ padding: "0px 16px 0px 16px" }} key="2" icon={<AccountTreeOutlined style={{ fontSize: "18px" }} />}>
                Диаграмма Ганта
              </Menu.Item>
              <Menu.Item style={{ padding: "0px 16px 0px 16px" }} key="3" icon={<ArchiveIcon style={{ fontSize: "18px" }} />}>
                Архив
              </Menu.Item>
              <Divider style={{ margin: "8px 0px 8px 0px" }}></Divider>
              <Menu.Item style={{ padding: "0px 16px 0px 16px" }} key="4" icon={<Dashboard style={{ fontSize: "18px" }} />}>
                Пользователи
              </Menu.Item>

              <Menu.Item style={{ padding: "0px 16px 0px 16px" }} key="5" icon={<Dashboard style={{ fontSize: "18px" }} />}>
                Роли
              </Menu.Item>
            </Menu>
          </Sider>
          <>
            {isBoardLoading ? (
              <Spin size="large" />
            ) : (
              <>
                {selectedMenuItem === "1" && (
                  <KanbanLayout
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
                )}
                {selectedMenuItem === "2" && <GanttChart />}
                {selectedMenuItem === "3" && <Archive boardId={boardId} />}
                {selectedMenuItem === "4" && <Users userId={userId} boardId={boardId} usersBoard={usersBoard} />}
                {selectedMenuItem === "5" && <Roles userId={userId} boardId={boardId} usersBoard={usersBoard} />}
              </>
            )}
          </>
        </Layout>
      </Layout>

      <Modal footer={null} title="Новый столбец" open={openAddSectionModal} onCancel={() => setOpenAddSectionModal(false)}>
        <Form form={form} onFinish={handleAddState}>
          <Form.Item name="title" rules={[{ required: true, message: "Please input the name!" }]}>
            <Input required placeholder="Заголовок" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Создать приоритет
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
              <Tag key={`${priority?.name}`} color={`${priority?.color}`}>
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
