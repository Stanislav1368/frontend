import { useState } from "react";
import { Upload, Button, Flex, message, Divider, Image } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { BASE_URL, deleteFile, fetchFiles, uploadFile } from "../../../api";
import { UploadOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/ru"; // Импорт локализации "ru" для Moment.js

moment.locale("ru"); // Установка локализации на "ru"

const FileComponent = ({ taskId, currentRole }) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: files, isLoading } = useQuery(["files", taskId], () => fetchFiles(taskId));

  const handleFileUpload = async (file) => {
    console.log(file);
    try {
      setUploading(true);
      await uploadFile(file, taskId);
      message.success("Файл успешно загружен");
      queryClient.invalidateQueries("files");
    } catch (error) {
      message.error("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  };
  const handleFileDelete = async (file) => {
    console.log(file);
    try {
      await deleteFile(file);
      message.success("Файл удален");
      queryClient.invalidateQueries("files");
    } catch (error) {
      message.error("Не удалось удалить файл");
    } finally {
      setUploading(false);
    }
  };
  const renderFileContent = (file) => {

    if (file.type.startsWith("image")) {
      return <Image style={{ height: "100%", width: "130px" }} src={`${BASE_URL}/files/download/${file.id}`} alt={file.name} />;
    } else {
      let fileExtension = file.name.split(".").pop().toLowerCase();
      return <div className="fileIcon">{fileExtension}</div>;
    }
  };

  return (
    <div>
      <Divider orientation="left" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ alignItems: "center" }}>
          <UploadOutlined /> Прикрепленные файлы
        </div>
      </Divider>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column" }}>
        <Button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                handleFileUpload(file);
              }
            };
            input.click();
          }}
          loading={uploading}>
          <PlusOutlined />
          Загрузить
        </Button>

        {files?.map((file) => (
          <Flex key={file.id} style={{ justifyContent: "space-between", height: "90px", backgroundColor: "rgba(192, 192, 192, 0.3)" }}>
            {renderFileContent(file)}
            <Flex style={{ flexDirection: "row", flex: 1 }}>
              <div style={{ flexGrow: 1, textOverflow: "ellipsis", overflow: "hidden", marginLeft: "5px" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <span style={{ marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
                  <span style={{ margin: "auto 0px 5px 0px" }}>{moment(file.createdAt).format("DD.MM.HH [в] HH:mm")}</span>
                </div>
              </div>

              <a href={`http://localhost:5000/files/download/${file.id}`} download>
                <button
                  className="actionFile"
                  style={{
                    height: "100%",
                    width: "50px",
                    alignContent: "center",
                    border: "none",
                    boxShadow: "none",
                    cursor: "pointer",
                  }}>
                  <DownloadOutlined style={{ fontSize: "20px", color: "#1976d2" }} />
                </button>
              </a>
              <button
                onClick={() => handleFileDelete(file)}
                className="actionFile"
                style={{
                  height: "100%",
                  width: "50px",
                  alignContent: "center",
                  border: "none",
                  boxShadow: "none",
                  cursor: "pointer",
                }}>
                <DeleteOutlined style={{ fontSize: "20px", color: "#d32f2f" }} />
              </button>
            </Flex>
          </Flex>
        ))}
      </div>
    </div>
  );
};

export default FileComponent;
