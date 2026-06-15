import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import ReferencePickerModal from "./ReferencePickerModal";

import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { orgGateApi } from "../../../../api";
import "./editor.css";

export default function RichTextEditor({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "editorImage",
        },
      }),
      Placeholder.configure({
        placeholder: "Write documentation here...",
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("URL:");
    if (!url) return;

    editor.chain().focus().setLink({ href: url }).run();
  }
  async function insertImageFile(file) {
    if (!file) return;

    const { url } = await orgGateApi.uploadAdminImage(file);

    editor
      .chain()
      .focus()
      .setImage({ src: url })
      .run();
  }

  async function handleImageInputChange(e) {
    const file = e.target.files?.[0];
    await insertImageFile(file);

    // reset, damit dieselbe Datei später erneut ausgewählt werden kann
    e.target.value = "";
  }

  function insertReference(reference) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: `${reference.type}: ${reference.label}`,
        marks: [
          {
            type: "link",
            attrs: {
              href: `ref://${reference.type}/${reference.id}`,
              target: null,
              rel: null,
              class: "docReference",
              "data-ref-type": reference.type,
              "data-ref-id": reference.id,
            },
          },
        ],
      })
      .insertContent(" ")
      .run();
  }

  return (
    <div className="richEditor">
      <div className="richToolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>

        <button type="button" onClick={setLink}>
          Link
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          Unlink
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage ? "Uploading..." : "Image"}
        </button>

        <button
          type="button"
          className={editor.isActive("codeBlock") ? "isActive" : ""}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>

        <button type="button" onClick={() => setReferenceModalOpen(true)}>
          Reference
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageInputChange}
        />
      </div>

      <EditorContent editor={editor} className="richEditorContent" />
      {referenceModalOpen && (
        <ReferencePickerModal
          onClose={() => setReferenceModalOpen(false)}
          onSelect={(reference) => {
            insertReference(reference);
            setReferenceModalOpen(false);
          }}
        />
      )}
    </div>
    
  );
}