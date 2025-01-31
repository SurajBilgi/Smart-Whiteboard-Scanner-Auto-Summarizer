import "tldraw/tldraw.css";
import { useSyncDemo } from "@tldraw/sync";
import { Tldraw } from "tldraw";

export const Whiteboard = ({ children }: { children?: React.ReactNode }) => {
  const store = useSyncDemo({ roomId: "openai-hackathon" });
  return (
    <Tldraw
      store={store}
      onMount={(editor) => {
        editor.zoomToFit();
      }}
    >
      {children}
    </Tldraw>
  );
};
