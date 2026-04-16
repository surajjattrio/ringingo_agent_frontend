// websocketClient.ts

import { io, Socket } from "socket.io-client";
//import { baseUrl } from "@/API/baseURL";

const baseUrl = `${process.env.BASE_URL}`;

const connectWebSocket = (): Socket => {
  console.log("SOCKET SET");
  const socket = io(baseUrl);

  socket.on("connect", () => {
    console.log("socket connected");
  });

  socket.on("logout", () => {
    console.log("Received logout event. Logging out...");
    // Your logout logic here...
    // Perform any necessary cleanup or redirect to the login page
  });

  return socket;
};

export default connectWebSocket;
