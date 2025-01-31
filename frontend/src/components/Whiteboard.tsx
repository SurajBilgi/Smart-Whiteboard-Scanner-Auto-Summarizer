import "tldraw/tldraw.css";
import { useSyncDemo } from "@tldraw/sync";
import { Tldraw } from "tldraw";

export const Whiteboard = ({
  children,
  readOnly,
}: {
  children?: React.ReactNode;
  readOnly?: boolean;
}) => {
  const store = useSyncDemo({ roomId: "openai-hackathon" });
  const whiteboard = (
    <Tldraw
      hideUi={readOnly}
      store={store}
      onMount={(editor) => {
        editor.zoomToFit();
      }}
    >
      {children}
    </Tldraw>
  );

  if (!readOnly) {
    return whiteboard;
  }

  // if readonly, wrap in a div with position relative and overlay a transparent div
  return (
    <div style={{ position: "relative" }}>
      {whiteboard}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
        }}
      />
    </div>
  );
};
