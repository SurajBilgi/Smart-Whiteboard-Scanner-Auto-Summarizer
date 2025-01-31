import { useSyncDemo } from "@tldraw/sync";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export function ProfessorApp() {
  const store = useSyncDemo({ roomId: "openai-hackathon" });

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw store={store} />
    </div>
  );
}
