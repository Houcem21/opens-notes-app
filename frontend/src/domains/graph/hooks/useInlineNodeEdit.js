import { useEffect, useState } from "react";

export function useInlineNodeEdit({
  id,
  title,
  details,
  onRename,
  onUpdateDetails,
}) {
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localDetails, setLocalDetails] = useState(details || "");

  useEffect(() => {
    setLocalTitle(title || "");
    setLocalDetails(details || "");
  }, [title, details]);

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

  function saveDetails() {
    if ((localDetails || "") !== (details || "")) {
      onUpdateDetails?.(id, localDetails);
    }
  }

  return {
    localTitle,
    localDetails,
    setLocalTitle,
    setLocalDetails,
    saveTitle,
    saveDetails,
  };
}