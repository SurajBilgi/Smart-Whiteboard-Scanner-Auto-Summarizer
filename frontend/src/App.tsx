import React, { useState } from "react";
import { Container, Heading, Text, Box, Flex } from "@radix-ui/themes";
import { FileUpload } from "./components/FileUpload";
import { Chat, Message } from "./components/Chat";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasImage, setHasImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async () => {
    setIsAnalyzing(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setIsAnalyzing(false);
    setHasImage(true);
    setMessages([
      {
        id: 1,
        sender: "assistant",
        text: "I have analyzed the image. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Box style={{ height: "100dvh" }}>
      <Chat
        firstSlot={
          <FileUpload
            onImageUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
          />
        }
        isEnabled={hasImage && !isAnalyzing}
        isAnalyzing={isAnalyzing}
        messages={messages}
        setMessages={setMessages}
      />
    </Box>
  );
}

export default App;
