import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

function ChatRoom() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const { username } = state || {};
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("join_room", { username, roomId });

    socket.on("user_joined", (msg) => {
      setMessages((prev) => [...prev, { message: msg, system: true }]);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("user_joined");
      socket.off("receive_message");
    };
  }, [roomId, username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("send_message", {
        username,
        roomId,
        message,
      });
      setMessage("");
    }
  };

  const isCurrentUser = (msgUsername) => msgUsername === username;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-center border-b border-gray-700">
        <h2 className="text-xl font-semibold">Room: {roomId}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4  bg-cover bg-center">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            {msg.system ? (
              <p className="text-gray-400 italic text-center">{msg.message}</p>
            ) : (
              <div
                className={`flex ${
                  isCurrentUser(msg.username) ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    isCurrentUser(msg.username)
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">
                    {!isCurrentUser(msg.username) && (
                      <span className="text-xs text-pink-700">
                        {msg.username}
                        <br />
                      </span>
                    )}
                     <span className="text-xs ">
                        {msg.message}
                        <br />
                      </span>
                    <span className="text-xs text-gray-400 block mt-1 ml-1.5 ">
                      {msg.timestamp} 
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
