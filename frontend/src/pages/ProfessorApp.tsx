import "tldraw/tldraw.css";
import { Whiteboard } from "../components/Whiteboard";

export function ProfessorApp() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Whiteboard />
    </div>
  );
}
