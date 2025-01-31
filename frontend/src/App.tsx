import React, { useState } from "react";
import { Container, Heading, Text, Box, Flex } from "@radix-ui/themes";
import { FileUpload } from "./components/FileUpload";
import { Chat, Message } from "./components/Chat";
import { Sidebar } from "./components/Sidebar";
import { PanelsTopLeft } from "lucide-react";
import { uploadImage } from "./uploadImage";

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  hasImage: boolean;
  preview: string | null;
}

function App() {
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
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const result = await uploadImage(preview);
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

  const handleSetMessages = (messages: Message[]) => {
    if (!currentChatId) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, ...messages],
            }
          : chat
      )
    );
  };

  console.log("[] isEnabled", Boolean(currentChat?.hasImage && !isAnalyzing));
  console.log("[] currentChat", currentChat);

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

export default App;
