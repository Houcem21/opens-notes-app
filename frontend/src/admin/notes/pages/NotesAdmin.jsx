import NotesWorkspace from "../../../domains/notes/components/NotesWorkspace";
import "../../../domains/notes/styles/notes.css";

export default function NotesAdmin() {
  return <NotesWorkspace readOnly={false} />;
}