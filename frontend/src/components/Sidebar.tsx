import React from "react";
import { Box, Button, ScrollArea, Text, Flex } from "@radix-ui/themes";
import { PanelLeft, Plus, MessageSquare } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  currentChatId: string | null;
  chats: { id: string; name: string }[];
  onSelectChat: (id: string) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  currentChatId,
  chats,
  onSelectChat,
}: SidebarProps) {
  return (
    <>
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "300px",
          height: "100vh",
          backgroundColor: "var(--gray-1)",
          transform: `translateX(${isOpen ? "0" : "-100%"})`,
          transition: "transform 0.3s ease-in-out",
          borderRight: "1px solid var(--gray-4)",
          zIndex: 50,
        }}
      >
        <Flex direction="column" height="100%">
          <Box p="4" style={{ borderBottom: "1px solid var(--gray-4)" }}>
            <Button
              onClick={onNewChat}
              size="3"
              variant="soft"
              style={{ width: "100%" }}
            >
              <Plus size={16} />
              New Chat
            </Button>
          </Box>

          <ScrollArea style={{ flex: 1 }}>
            <Box p="2">
              {chats.map((chat) => (
                <Box
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor:
                      currentChatId === chat.id
                        ? "var(--accent-3)"
                        : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Flex gap="2" align="center">
                    <MessageSquare size={16} />
                    <Text size="2">{chat.name}</Text>
                  </Flex>
                </Box>
              ))}
            </Box>
          </ScrollArea>
        </Flex>
      </Box>

      {/* Overlay */}
      {isOpen && (
        <Box
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 40,
          }}
        />
      )}
    </>
  );
}
