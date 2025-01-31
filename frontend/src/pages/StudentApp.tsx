import { Box, Grid } from "@radix-ui/themes";
import React, { useState } from "react";
import "tldraw/tldraw.css";
import { Chat, Message } from "../components/Chat";
import { TldrawAutoImageCapture } from "../components/TldrawAutoImageCapture";
import { Whiteboard } from "../components/Whiteboard";
import { FileUpload } from "../components/FileUpload";

export interface ChatSession {
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
  const currentChatIdRef = React.useRef<string | null>(null);

  currentChatIdRef.current = currentChatId;

  const currentChat = chats.find((chat) => chat.id === currentChatId);

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
    if (!currentChatIdRef.current) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatIdRef.current
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
          chat.id === currentChatIdRef.current
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

  console.debug("[] isEnabled", Boolean(currentChat?.hasImage && !isAnalyzing));
  console.debug("[] currentChat", currentChat);
  console.debug("[] chats", chats);

  return (
    <Grid style={{ height: "100dvh" }} columns="1fr 500px">
      <Whiteboard readOnly={true}>
        <TldrawAutoImageCapture
          chats={chats}
          setChats={setChats}
          setCurrentChatId={setCurrentChatId}
          currentChatIdRef={currentChatIdRef}
          onCapture={(messages) => handleSetMessages(messages)}
        />
      </Whiteboard>
      <Box style={{ height: "100dvh", overflow: "hidden" }}>
        <Chat
          // for now, use FileUpload solely for preview
          imagePreview={<FileUpload preview={currentChat?.preview} />}
          isEnabled={Boolean(currentChat?.messages.length)}
          isAnalyzing={isAnalyzing}
          messages={currentChat?.messages || []}
          setMessages={handleSetMessages}
        />
      </Box>
    </Grid>
  );
}
