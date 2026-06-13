import { useEffect, useState } from "react";

export function useInlineNodeEdit({
  id,
  title,
  notes,
  onRename,
  onUpdateNotes,
}) {
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localNotes, setLocalNotes] = useState(notes || "");

  useEffect(() => {
    setLocalTitle(title || "");
    setLocalNotes(notes || "");
  }, [title, notes]);

  function saveTitle() {
    const nextTitle = localTitle.trim();

    if (!nextTitle) {
      setLocalTitle(title || "");
      return;
    }

    if (nextTitle !== title) {
      onRename?.(id, nextTitle);
    }
  }

  function saveNotes() {
    if ((localNotes || "") !== (notes || "")) {
      onUpdateNotes?.(id, localNotes);
    }
  }

  return {
    localTitle,
    localNotes,
    setLocalTitle,
    setLocalNotes,
    saveTitle,
    saveNotes,
  };
}