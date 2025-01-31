import { useEffect, useRef } from "react";
import { exportToBlob, useEditor } from "tldraw";
import { uploadImageBlob } from "../uploadImage";
import { Message } from "./Chat";

const isEqualArrays = (arr1: Array<any>, arr2: Array<any>) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
};

export const TldrawAutoImageCapture = ({
  interval = 10000,
  setMessages,
}: {
  interval?: number;
  setMessages: (messages: Message[]) => void;
}) => {
  const lastShapeIds = useRef<Set<string>>(new Set());
  const editor = useEditor();

  useEffect(() => {
    let inProgress = false;

    const runCaptureAndUpload = async () => {
      console.log("[] Running auto image capture");
      const shapeIds = editor.getCurrentPageShapeIds();
      console.log("[]", {
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
        const openAIResponse = await uploadImageBlob(blob);
        if (!openAIResponse) {
          return;
        }
        const assistantMessage: Message = {
          id: Date.now(),
          text: openAIResponse.explanation,
          imageId: openAIResponse.image_id,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages([assistantMessage]);
      } catch (ex) {
        console.error(ex);
      }
      inProgress = false;
    };
    runCaptureAndUpload();
    const timer = setInterval(() => {
      runCaptureAndUpload();
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [editor]);

  return null;
};
