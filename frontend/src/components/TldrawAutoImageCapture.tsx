import { useEffect, useRef } from "react";
import { exportToBlob, useEditor } from "tldraw";
import { uploadImageBlob } from "../uploadImage";
import { Message } from "./Chat";
import { ChatSession } from "../pages/StudentApp";
import { blobToBase64 } from "../utils/blobToBase64";
import { debounce } from "../utils/debounce";

const isEqualArrays = (arr1: Array<any>, arr2: Array<any>) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
};

export const TldrawAutoImageCapture = ({
  chats,
  setCurrentChatId,
  setChats,
  currentChatIdRef,
  onCapture,
  setIsAnalyzing,
}: {
  interval?: number;
  chats: ChatSession[];
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentChatIdRef: React.MutableRefObject<string | null>;
  onCapture: (messages: Message[]) => void;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const lastShapeIds = useRef<Set<string>>(new Set());
  const editor = useEditor();

  useEffect(() => {
    let inProgress = false;

    const runCaptureAndUpload = async () => {
      console.log("[] Running auto image capture");
      const shapeIds = editor.getCurrentPageShapeIds();
      console.debug("[]", {
        inProgress,
        shapeIds,
        refShapes: lastShapeIds.current,
        isEqual: isEqualArrays(
          Array.from(shapeIds.values()),
          Array.from(lastShapeIds.current.values())
        ),
      });
      if (
        inProgress ||
        shapeIds.size === 0 ||
        isEqualArrays(
          Array.from(shapeIds.values()),
          Array.from(lastShapeIds.current.values())
        )
      ) {
        console.log("[] Skipping auto image capture");
        return;
      }

      lastShapeIds.current = shapeIds;
      console.log("[] Exporting to Blob");
      let blob;
      try {
        blob = await exportToBlob({
          editor,
          ids: [...shapeIds],
          format: "png",
          opts: { background: false },
        });
        inProgress = true;
        console.log("[] Uploading and retrieving open AI response");
        setIsAnalyzing(true);
        const openAIResponse = await uploadImageBlob(blob);
        setIsAnalyzing(false);
        if (!openAIResponse) {
          console.error("[] No open AI response");
          return;
        }

        if (!currentChatIdRef.current) {
          const preview = await blobToBase64(blob);
          const newChat: ChatSession = {
            id: Date.now().toString(),
            name: `Chat ${chats.length + 1}`,
            messages: [],
            hasImage: true,
            preview: preview,
          };
          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(newChat.id);
          currentChatIdRef.current = newChat.id;
        }

        onCapture([
          {
            id: Date.now(),
            text: openAIResponse.explanation,
            imageId: openAIResponse.image_id,
            sender: "assistant",
            timestamp: new Date(),
          },
        ]);
      } catch (ex) {
        console.error(ex);
      }
      inProgress = false;
    };

    const debouncedRunAndCaptureUpload = debounce(runCaptureAndUpload, 5000);

    const handler = () => {
      debouncedRunAndCaptureUpload();
    };

    runCaptureAndUpload();
    // add a window handler for a custom "whiteboard updated" event
    window.addEventListener("whiteboardUpdated", handler);
    return () => {
      window.removeEventListener("whiteboardUpdated", handler);
    };
  }, []);

  return null;
};
