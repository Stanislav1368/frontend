import { useEffect } from "react";
import SocketApi from "./api";

export const useConnectSocket = () => {
  const connectSocket = () => {
    SocketApi.createConnection();
  };
  useEffect(() => {
    connectSocket();
  }, []);
};
