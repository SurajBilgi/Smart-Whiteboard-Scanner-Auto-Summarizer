import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Text,
  ScrollArea,
  Flex,
} from "@radix-ui/themes";
import { Send, ArrowDown } from "lucide-react";
import { MarkdownWithMath } from "./MarkdownWithMath";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  imageId?: string;
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  // const handleScroll = useCallback(() => {
  //   if (!scrollViewportRef.current) return;

  //   const { scrollHeight, scrollTop, clientHeight } = scrollViewportRef.current;
  //   const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  //   setShowScrollButton(!isNearBottom);
  // }, []);

  // useEffect(() => {
  //   const viewport = scrollViewportRef.current;
  //   if (viewport) {
  //     viewport.addEventListener("scroll", handleScroll);
  //     return () => viewport.removeEventListener("scroll", handleScroll);
  //   }
  // }, [handleScroll]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
      <Box
        style={{ flexGrow: 1, overflow: "hidden", position: "relative" }}
        p="5"
      >
        {(messages.length === 0 || isAnalyzing) && (
          <div className="flex items-center justify-center h-full p-8 text-gray-600 text-center transition-all duration-300 ease-in-out animate-fade-in">
            <p className="text-base animate-pulse">Analyzing whiteboard...</p>
          </div>
        )}
        {messages.length > 0 && (
          <ScrollArea ref={scrollAreaRef}>
            <div ref={scrollViewportRef}>
              {imagePreview}
              {messages.length > 0 && !isAnalyzing && (
                <>
                  {messages.map((message, index) => (
                    <Box
                      key={message.id}
                      mb="3"
                      ref={
                        index === messages.length - 1
                          ? lastMessageRef
                          : undefined
                      }
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
                        <Text
                          size="1"
                          color={message.sender === "user" ? undefined : "gray"}
                          style={{
                            opacity: 0.7,
                            color:
                              message.sender === "user" ? "white" : undefined,
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        )}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="2"
            variant="solid"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              borderRadius: "full",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 10,
            }}
          >
            <ArrowDown size={16} />
            New message
          </Button>
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
