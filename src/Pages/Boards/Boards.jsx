import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment/moment";
import { AddBoard, fetchBoards, fetchUser, updateBoard } from "../../api";
import "./Boards.css";
import { Button, Spin, Card, Col, Form, Input, Layout, Modal, Row, Switch, Drawer, Flex } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Archive, ArchiveOutlined, Star } from "@mui/icons-material";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";

const Boards = () => {
  const queryClient = useQueryClient();
  const [openAddBoardModal, setOpenAddBoardModal] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false); // Состояние для отображения Drawer
  const { data: user, isLoading: isUserLoading } = useQuery("user", fetchUser);
  const { data: boards, isLoading: isBoardsLoading } = useQuery("boards", () => fetchBoards(user.id), { enabled: !!user });

  const AddBoardMutation = useMutation((data) => AddBoard(data, user.id), {
    onSuccess: () => queryClient.invalidateQueries(["boards"]),
  });

  const handleToggleFavorite = async (boardId) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return { ...board, favorite: !board.favorite };
      }
      return board;
    });

    const updatedFavorite = !boards.find((board) => board.id === boardId).favorite;

    await updateBoard(user.id, boardId, { favorite: updatedFavorite });

    queryClient.setQueryData("boards", updatedBoards);
  };

  const handleToggleArchived = async (boardId) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === boardId) {
        return { ...board, isArchived: !board.isArchived };
      }
      return board;
    });

    const updatedIsArchived = !boards.find((board) => board.id === boardId).isArchived;

    await updateBoard(user.id, boardId, { isArchived: updatedIsArchived });

    queryClient.setQueryData("boards", updatedBoards);
  };

  // Фильтрация досок по isArchived
  const filteredBoards = showOnlyFavorites
    ? boards?.filter((board) => board.favorite && !board.isArchived)
    : boards?.filter((board) => !board.isArchived);

  // Фильтрация заархивированных досок
  const archivedBoards = boards?.filter((board) => board.isArchived);

  const addBoard = async (values) => {
    try {
      setOpenAddBoardModal(false);
      AddBoardMutation.mutate(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={false}></Navbar>
        <div className="body-boards">
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div className="switch-element">
              <span>{showOnlyFavorites ? <Star style={{ color: "gold" }}></Star> : <Star style={{ color: "gray" }}></Star>}</span>
              <Switch checked={showOnlyFavorites} onChange={(checked) => setShowOnlyFavorites(checked)} />
            </div>
            <Button onClick={() => setShowArchiveDrawer(true)}>Архив</Button>
          </div>

          {isBoardsLoading ? (
            <Spin size="large" />
          ) : (
            <>
              <Row className="grid-boards" gutter={16}>
                {filteredBoards?.map((board) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={board.id} style={{ margin: "8px 0px" }}>
                    <Card
                      bodyStyle={{ padding: "0px 15px", width: "100%" }}
                      style={{
                        height: "100px",
                        width: "100%",
                      }}
                      onClick={() => {
                        window.location.href = `/boards/${board.id}`;
                      }}>
                      <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center", width: "100%" }}>
                        <span>{board.title}</span>
                        <div style={{ display: "flex" }}>
                          <Button
                            type="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(board.id);
                            }}
                            icon={<Star style={{ color: board.favorite ? "gold" : "grey" }} />}
                          />
                          <Button
                            type="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleArchived(board.id);
                            }}
                            icon={<ArchiveOutlined color="primary" />}
                          />
                        </div>
                      </div>
                      <div className="board-created-date">Создана {moment.utc(board.createdAt).format("DD.MM.YYYY")}</div>
                    </Card>
                  </Col>
                ))}
                <Col xs={24} sm={12} md={8} lg={6} style={{ margin: "8px 0px" }}>
                  <Card className="add-board" onClick={() => setOpenAddBoardModal(true)}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <PlusCircleOutlined style={{ fontSize: "48px", color: "#D1D1D1" }}></PlusCircleOutlined>
                      Создать доску
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </div>
      </Layout>
      <Drawer title="Архив" placement="right" closable={true} onClose={() => setShowArchiveDrawer(false)} open={showArchiveDrawer}>
        {archivedBoards?.map((board) => (
          <Card
            title={
              <Flex style={{ alignItems: "center", justifyContent: "space-between" }}>
                {board.title}
                <Button
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleArchived(board.id);
                  }}
                  icon={<ArchiveOutlined color="primary" />}
                />
              </Flex>
            }
            bodyStyle={{ padding: "0px 15px", width: "100px" }}
            style={{ height: "110px", width: "100%" }}
            onClick={() => {
              window.location.href = `/boards/${board.id}`;
            }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex" }}></div>
            </div>
            <div className="board-created-date">Создана {moment.utc(board.createdAt).format("DD.MM.YYYY")}</div>
          </Card>
        ))}
      </Drawer>

      <Modal title="Новая доска" open={openAddBoardModal} onCancel={() => setOpenAddBoardModal(false)} footer={null}>
        <Form onFinish={addBoard}>
          <Form.Item name="title" rules={[{ required: true, message: "Пожалуйста, введите заголовок" }]}>
            <Input placeholder="Заголовок" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              ОК
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Boards;
