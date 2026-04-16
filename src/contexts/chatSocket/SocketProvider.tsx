// import { useAppDispatch } from "@/redux/hooks";
// import { useEffect } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "../hooks/useAuth";
// import {
//   onRecieveUnReadChat,
//   onRemoveUnReadChat,
//   onReceiveWhatsAppMessage,
//   hideWhatsAppPopup,
//   onReceiveOmniChannelMessage,
//   hideOmniChannelPopup
// } from "@/redux/slice/chatSlice";

// interface ISocketProvider {
//   children: any;
// }

// export const SocketProvider = (props: ISocketProvider) => {
//   const dispatch = useAppDispatch();
//   const { user } = useAuth();
//   const baseUrl: any = process.env.BASE_URL;
//   console.log("user", user);
//   // Configure socket with authentication and query parameters
//   const socketConnection = io(baseUrl, {
//     query: {
//       // Authentication data
//       token: user?.access_token,
//       agent_uuid: user?.agent_detail?.uuid,
//       browserToken: user?.agent_detail?.browserToken,
//       // Additional query parameters
//       user_uuid: user?.agent_detail?.uuid,
//       user_id: user?.id,
//       agent_id: user?.agent_detail?.id,
//     },
//     // Authentication via headers (alternative approach)
//     auth: {
//       token: user?.access_token,
//       browserToken: user?.agent_detail?.browserToken,
//     },
//     // Connection options
//     transports: ["websocket", "polling"], // Force websocket transport
//     autoConnect: true, // Auto connect on instantiation
//     reconnection: true, // Enable reconnection
//     reconnectionAttempts: 5, // Number of reconnection attempts
//     reconnectionDelay: 1000, // Delay between reconnection attempts
//     timeout: 20000, // Connection timeout
//   });

//   useEffect(() => {
//     let browserToken = user?.agent_detail?.browserToken;

//     // Listen for 'connect' event
//     socketConnection.on("connect", () => {
//       console.log("Connected to server!");
//     });

//     // Listen for 'disconnect' event
//     socketConnection.on("disconnect", () => {
//       console.log("Disconnected from server!");
//     });
//     socketConnection.on("whatsapp_message", (data) => {
//       console.log("Received WhatsApp message from server:", data);
//       // Trigger WhatsApp popup if messageId is provided
//       if (data.messageId) {
//         dispatch(onReceiveWhatsAppMessage(data));
//       }
//     });
//     // Trigger Omnichannel popop
//         socketConnection.on("omnichannel_message", (data) => {
//       console.log("Received omnichannel_message message from server:", data);
//       // Trigger WhatsApp popup if messageId is provided
//       if (data.messageId) {
//         dispatch(onReceiveOmniChannelMessage(data))
//       }
//     });


//     socketConnection.on("ui:closePopup", (data) => {
//       console.log("Popup:", data);
//       // debugger
//       // dispatch(hideOmniChannelPopup());
//       // if (data?.reason === "accepted" && data?.channelType === "instagram") {
//       // }
//       // else {
//         dispatch(hideWhatsAppPopup());
//       // }
//       // Trigger WhatsApp popup if messageId is provided
//     });
//     // Listen for 'browser_token-message' event
//     socketConnection.on(browserToken + "-message", (data) => {
//       console.log("Received data from server:", data);
//       dispatch(onRecieveUnReadChat(data));
//     });
//     // this.server.to(socketId).emit("whatsapp_message_live", payload);
//     socketConnection.on("whatsapp_message_live", (data) => {
//       console.log("Received data from server live", data);
//       dispatch(onRecieveUnReadChat(data));
//     });

//     socketConnection.on(browserToken + "-message-remove", (data) => {
//       console.log("Received data from server to remove unread message:", data);
//       dispatch(onRemoveUnReadChat(data));
//     });

//     // Clean up function to disconnect socket on component unmount
//     return () => {
//       if (socketConnection) {
//         socketConnection.disconnect();
//       }
//     };
//   }, []);

//   return <div>{props.children}</div>;
// };


import { useAppDispatch } from "@/redux/hooks";
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  onRecieveUnReadChat,
  onRemoveUnReadChat,
  onReceiveWhatsAppMessage,
  hideWhatsAppPopup,
  onReceiveOmniChannelMessage,
  hideOmniChannelPopup
} from "@/redux/slice/chatSlice";
import { getSocket } from "@/config/socket";

interface ISocketProvider {
  children: any;
}

export const SocketProvider = ({ children }: ISocketProvider) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = getSocket(user);

    const browserToken = user?.agent_detail?.browserToken;
    socketRef.current.emit("join_user_room", user?.agent_detail?.uuid);
    /** --- SOCKET LISTENERS --- **/
    socketRef.current.on("connect", () => console.log("Connected to server"));
    socketRef.current.on("disconnect", () => console.log("Disconnected"));
    socketRef.current.on("whatsapp_message", (data: any) => {
      if (data.messageId) dispatch(onReceiveWhatsAppMessage(data));
    });
    socketRef.current.on("omnichannel_message", (data: any) => {
      if (data.messageId) dispatch(onReceiveOmniChannelMessage(data));
    });
    socketRef.current.on("ui:closePopup", () => dispatch(hideOmniChannelPopup()));
    socketRef.current.on(`${browserToken}-message`, (data: any) => dispatch(onRecieveUnReadChat(data)));
    socketRef.current.on("whatsapp_message_live", (data: any) => dispatch(onRecieveUnReadChat(data)));
    socketRef.current.on(`${browserToken}-message-remove`, (data: any) => dispatch(onRemoveUnReadChat(data)));

    return () => {
      // ❗ Remove listeners ONLY
      socketRef.current?.off("connect");
      socketRef.current?.off("disconnect");
      socketRef.current?.off("whatsapp_message");
      socketRef.current?.off("omnichannel_message");
      socketRef.current?.off("ui:closePopup");
      socketRef.current?.off(`${browserToken}-message`);
      socketRef.current?.off("whatsapp_message_live");
      socketRef.current?.off(`${browserToken}-message-remove`);
    };
  }, [user]);

  return <>{children}</>;
};

