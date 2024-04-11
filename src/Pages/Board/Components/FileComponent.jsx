import { useState } from "react";
import { Upload, Button, Flex, message, Card, Image } from "antd";
import { useQuery, useQueryClient } from "react-query";
import { fetchFiles, uploadFile } from "../../../api";
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/ru"; // Импорт локализации "ru" для Moment.js

moment.locale("ru"); // Установка локализации на "ru"

const FileComponent = ({ taskId }) => {
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
  const renderFileContent = (file) => {
    console.log(file.type);
    if (file.type.startsWith("image")) {
      return <Image style={{ height: "100%", width: "130px" }} src={`http://localhost:5000/files/download/${file.id}`} alt={file.name} />;
    } else {
      if (file.type === "application/pdf") {
        return <div className="fileIcon">pdf</div>;
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return <div className="fileIcon">docx</div>;
      } else {
        return <div>{`(${file.type.split("/")[1]})`}</div>;
      }
    }
  };
  console.log(files);
  return (
    <div>
      {/* Загрузка файла */}
      <Upload
        showUploadList={false}
        beforeUpload={(file) => {
          handleFileUpload(file);
          return false;
        }}>
        <Button type="primary" loading={uploading} icon={<UploadOutlined />}>
          Загрузить файл
        </Button>
      </Upload>

      {/* Список файлов */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexDirection: "column" }}>
        {files?.map((file) => (
          <Flex key={file.id} style={{ justifyContent: "space-between", height: "90px", backgroundColor: "rgba(192, 192, 192, 0.3)" }}>
            {renderFileContent(file)}
            <Flex style={{ flexDirection: "row", flex: 1 }}>
              <div style={{ flexGrow: 1, textOverflow: "clip" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", marginLeft: "5px" }}>
                  <span style={{ marginTop: "5px" }}>{file.name}</span>
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
                  <DeleteOutlined style={{ fontSize: "20px", color: "#d32f2f" }} />
                </button>
              </a>
            </Flex>
          </Flex>
          //   <Card key={file.id} style={{ width: 200 }} cover={<Image src={`http://localhost:5000/files/download/${file.id}`} alt={file.name} />}>
          //     <Card.Meta title={file.name} />
          //     <Button type="primary" block href={`http://localhost:5000/files/download/${file.id}`} download>
          //       Скачать
          //     </Button>
          //   </Card>
        ))}
      </div>
    </div>
  );
};

export default FileComponent;
