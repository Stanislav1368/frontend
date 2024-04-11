import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment/moment";
import { AddBoard, fetchBoards, fetchUser, updateBoard } from "../../api";
import "./Boards.css";
import { Button, Spin, Card, Col, Form, Input, Layout, Modal, Row, Switch } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Star } from "@mui/icons-material";
import Navbar from "../../Components/BoardHeader/Navbar/Navbar";

const Boards = () => {
  const queryClient = useQueryClient();
  const [openAddBoardModal, setOpenAddBoardModal] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
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

  const filteredBoards = showOnlyFavorites ? boards.filter((board) => board.favorite) : boards;
  const addBoard = async (values) => {
    try {
      setOpenAddBoardModal(false);
      AddBoardMutation.mutate(values);
    } catch (error) {
      console.error(error);
    }
  };
  console.log("Данные о досках:", boards);
  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Navbar backArrow={false}></Navbar>
        <div className="body-boards">
          <div className="switch-element">
            <span>{showOnlyFavorites ? <Star style={{ color: "gold" }}></Star> : <Star style={{ color: "gray" }}></Star>}</span>
            <Switch checked={showOnlyFavorites} onChange={(checked) => setShowOnlyFavorites(checked)} />
          </div>
          {isBoardsLoading ? (
            <Spin size="large" />
          ) : (
             (
              <>
                {/* Ваш текущий код для отображения досок */}
                <Row className="grid-boards" gutter={16}>
                  {Array.isArray(filteredBoards) &&
                    filteredBoards.map((board) => (
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
                            {board.title}
                            <Star
                              style={{ color: board.favorite ? "gold" : "grey" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(board.id);
                              }}></Star>
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
            )
          )}
        </div>
      </Layout>
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
