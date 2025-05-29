import { createContext, useContext, useEffect, ReactNode } from "react";
import { socket } from "../utils/socket"; // your existing socket.ts

const SocketContext = createContext(socket);

export const useSocket = () => useContext(SocketContext);

type Props = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: Props) => {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
