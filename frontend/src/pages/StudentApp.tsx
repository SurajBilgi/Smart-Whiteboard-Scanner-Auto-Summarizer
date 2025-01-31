import React, { useState } from "react";
import { Container, Heading, Text, Box, Flex, Grid } from "@radix-ui/themes";
import { FileUpload } from "../components/FileUpload";
import { Chat, Message } from "../components/Chat";
import { Sidebar } from "../components/Sidebar";
import { PanelsTopLeft } from "lucide-react";
import { uploadImageBase64 } from "../uploadImage";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useSyncDemo } from "@tldraw/sync";
import { TldrawAutoImageCapture } from "../components/TldrawAutoImageCapture";

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
  const store = useSyncDemo({ roomId: "openai-hackathon" });

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

  const handleImageUpload = async (preview: string) => {
    if (!currentChatId) {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        name: `Chat ${chats.length + 1}`,
        messages: [],
        hasImage: false,
        preview,
      };
      setChats((prev) => [...prev, newChat]);
      setCurrentChatId(newChat.id);
    }

    setIsAnalyzing(true);
    const result = await uploadImageBase64(preview);
    console.log("[] result", result);
    setIsAnalyzing(false);

    setChats((prev) =>
      prev.map((chat) =>
        // need to use a ref because in the await closure, we don't have access to the current state
        // hence, by using a ref, we can access the current state
        chat.id === currentChadIdRef.current
          ? {
              ...chat,
              hasImage: true,
              preview,
              messages: [
                {
                  id: Date.now(),
                  sender: "assistant",
                  text: "I have analyzed the image. What would you like to know?",
                  timestamp: new Date(),
                },
              ],
            }
          : chat
      )
    );
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
      <Tldraw store={store}>
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
      </Tldraw>
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

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw store={store}>
        <TldrawAutoImageCapture />
      </Tldraw>
    </div>
  );

  return (
    <Box style={{ height: "100dvh" }}>
      <PanelsTopLeft
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          cursor: "pointer",
        }}
        onClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        chats={chats.map(({ id, name }) => ({ id, name }))}
        onSelectChat={(id) => {
          setCurrentChatId(id);
          setIsSidebarOpen(false);
        }}
      />
      <Chat
        firstSlot={
          <FileUpload
            onImageUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
            preview={currentChat?.preview}
          />
        }
        isEnabled={Boolean(currentChat?.hasImage && !isAnalyzing)}
        isAnalyzing={isAnalyzing}
        messages={currentChat?.messages || []}
        setMessages={handleSetMessages}
      />
    </Box>
  );
}
