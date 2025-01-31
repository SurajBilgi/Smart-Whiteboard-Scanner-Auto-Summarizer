import React, { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { Box, Text, Card, Flex } from "@radix-ui/themes";

interface FileUploadProps {
  onImageUpload: () => void;
  isAnalyzing: boolean;
}

export function FileUpload({ onImageUpload, isAnalyzing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          onImageUpload();
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
            onImageUpload();
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [onImageUpload]
  );

  if (preview) {
    return (
      <Box p="4">
        <Flex direction="column" gap="3" align="center">
          <img
            src={preview}
            alt="Uploaded preview"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              objectFit: "contain",
              borderRadius: "var(--radius-3)",
            }}
          />
          {isAnalyzing && (
            <Text size="2" color="gray">
              Analyzing image
              <span className="dot-animation">...</span>
            </Text>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box p="4">
      <Card
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${
            isDragging ? "var(--accent-9)" : "var(--gray-6)"
          }`,
          backgroundColor: isDragging ? "var(--accent-2)" : "white",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
      >
        <Flex direction="column" align="center" gap="4" p="6">
          <UploadCloud size={48} style={{ color: "var(--accent-9)" }} />
          <Text align="center" size="2">
            Drag and drop files here, or{" "}
            <label style={{ color: "var(--accent-9)", cursor: "pointer" }}>
              browse
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInput}
                style={{ display: "none" }}
              />
            </label>
          </Text>
          <Text color="gray" size="1">
            Supports image files (PNG, JPG, GIF)
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
