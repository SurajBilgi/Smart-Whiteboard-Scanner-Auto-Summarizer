import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Text,
  Card,
  ScrollArea,
  Flex,
} from "@radix-ui/themes";
import { Send } from "lucide-react";
// import Markdown from "react-markdown";
import { MarkdownWithMath } from "./MarkdownWithMath";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  imageId?: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

interface ChatProps {
  imagePreview?: React.ReactNode;
  isEnabled: boolean;
  isAnalyzing: boolean;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export function Chat({
  imagePreview,
  isEnabled,
  isAnalyzing,
  messages,
  setMessages,
}: ChatProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = useCallback(() => {
    if (inputValue.trim() && isEnabled) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputValue.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([newMessage]);
      setInputValue("");
    }
  }, [inputValue, isEnabled]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isEnabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex direction="column" height="100%">
      <Box style={{ flexGrow: 1, overflow: "hidden" }} p="5">
        {(messages.length === 0 || isAnalyzing) && (
          <div className="flex items-center justify-center h-full p-8 text-gray-600 text-center transition-all duration-300 ease-in-out animate-fade-in">
            <img />
            <p className="text-base animate-pulse">Analyzing whiteboard...</p>
          </div>
        )}
        {messages.length > 0 && (
          <ScrollArea>
            {imagePreview}
            {messages.length > 0 && !isAnalyzing && (
              <>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    mb="3"
                    style={{
                      display: "flex",
                      justifyContent:
                        message.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      className={
                        message.sender === "user"
                          ? "chat-user"
                          : "chat-assistant"
                      }
                      style={{
                        backgroundColor:
                          message.sender === "user"
                            ? "var(--accent-9)"
                            : "var(--gray-3)",
                        color:
                          message.sender === "user"
                            ? "white !important"
                            : "var(--gray-12)",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        borderBottomRightRadius:
                          message.sender === "user" ? "4px" : "12px",
                        borderBottomLeftRadius:
                          message.sender === "assistant" ? "4px" : "12px",
                      }}
                    >
                      <MarkdownWithMath>{message.text}</MarkdownWithMath>
                      {/* <div dangerouslySetInnerHTML={{ __html: message.text }} /> */}
                      <Text
                        size="1"
                        color={message.sender === "user" ? undefined : "gray"}
                        style={{ opacity: 0.7, color: "white" }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </ScrollArea>
        )}
      </Box>

      <Box p="3" style={{ borderTop: "1px solid var(--gray-4)" }}>
        <Flex gap="2" align="end">
          <TextField.Root style={{ flex: 1 }}>
            <TextField.Input
              placeholder={
                isEnabled
                  ? "Ask a question..."
                  : "Analyzing whiteboard. Please wait to ask questions..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="2"
              disabled={!isEnabled}
            />
          </TextField.Root>
          <Button
            onClick={handleSend}
            size="2"
            variant="solid"
            disabled={!isEnabled}
          >
            <Send size={16} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
