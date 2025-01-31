import { Box, Grid } from "@radix-ui/themes";
import React, { useState } from "react";
import "tldraw/tldraw.css";
import { Chat, Message } from "../components/Chat";
import { TldrawAutoImageCapture } from "../components/TldrawAutoImageCapture";
import { Whiteboard } from "../components/Whiteboard";

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  hasImage: boolean;
  preview: string | null;
}

export function StudentApp() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentChadIdRef = React.useRef<string | null>(null);

  currentChadIdRef.current = currentChatId;

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  console.log("[] preview", currentChat?.preview);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      hasImage: false,
      preview: null,
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const handleSetMessages = async (messages: Message[]) => {
    if (!currentChadIdRef.current) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChadIdRef.current
          ? {
              ...chat,
              messages: [...chat.messages, ...messages],
            }
          : chat
      )
    );
    if (messages[0].sender === "user") {
      const imageIdFromChats = currentChat?.messages
        .slice()
        .reverse()
        .find(
          (message) => message.sender === "assistant" && message.imageId
        )?.imageId;
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_id: imageIdFromChats,
          message: messages[0].text,
        }),
      });
      const data = await response.json();
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChadIdRef.current
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: Date.now(),
                    sender: "assistant",
                    text: data.response,
                    timestamp: new Date(),
                  },
                ],
              }
            : chat
        )
      );
    }
  };

  console.log("[] isEnabled", Boolean(currentChat?.hasImage && !isAnalyzing));
  console.log("[] currentChat", currentChat);

  console.log("[] chats", chats);

  return (
    <Grid style={{ height: "100dvh" }} columns="1fr 500px">
      <Whiteboard>
        <TldrawAutoImageCapture
          setMessages={(message) => {
            if (!currentChatId) {
              const newChat: ChatSession = {
                id: Date.now().toString(),
                name: `Chat ${chats.length + 1}`,
                messages: [],
                hasImage: false,
                preview: null,
              };
              setChats((prev) => [...prev, newChat]);
              setCurrentChatId(newChat.id);
              currentChadIdRef.current = newChat.id;
            }

            handleSetMessages(message);
          }}
        />
      </Whiteboard>
      <Box style={{ height: "100dvh", overflow: "hidden" }}>
        <Chat
          isEnabled={Boolean(currentChat?.messages.length)}
          isAnalyzing={isAnalyzing}
          messages={currentChat?.messages || []}
          setMessages={handleSetMessages}
        />
      </Box>
    </Grid>
  );
}
