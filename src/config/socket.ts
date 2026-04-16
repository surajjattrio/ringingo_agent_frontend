import { io } from "socket.io-client";

let socket: any = null;

export const getSocket = (user: any) => {
  if (!socket) {
    console.log("Socket connnection established...................");
    socket = io(process.env.BASE_URL!, {
      query: {
        token: user?.access_token,
        agent_uuid: user?.agent_detail?.uuid,
        browserToken: user?.agent_detail?.browserToken,
        user_uuid: user?.agent_detail?.uuid,
        user_id: user?.id,
        agent_id: user?.agent_detail?.id,
      },
      auth: {
        token: user?.access_token,
        browserToken: user?.agent_detail?.browserToken,
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    console.log("Socket connnectedd.............", socket);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnnectedd.............");
  }
};
