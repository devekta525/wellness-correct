"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Undo,
  Redo,
  Save,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const LexicalEditor: React.FC<LexicalEditorProps> = ({
  initialContent = "",
  onChange,
  placeholder = "Start writing your medical note...",
}) => {
  const [content, setContent] = useState(initialContent);
  const [htmlContent, setHtmlContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
    // Convert markdown to HTML for preview
    setHtmlContent(convertMarkdownToHtml(content));
  }, [content, onChange]);

  const convertMarkdownToHtml = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>',
      )
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>',
      )
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-primary pl-4 italic my-2">$1</blockquote>',
      )
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^1\. (.*$)/gm, '<li class="ml-4">1. $1</li>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-primary underline" target="_blank">$1</a>',
      )
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (match, alt, src) =>
          `<img src="${src}" alt="${alt || "Image"}" class="max-w-full h-auto rounded my-2" />`,
      )
      .replace(/\n/g, "<br>");
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = before + selectedText + after;
    const newContent =
      content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case "bold":
        insertText("**", "**");
        break;
      case "italic":
        insertText("*", "*");
        break;
      case "underline":
        insertText("<u>", "</u>");
        break;
      case "strikethrough":
        insertText("~~", "~~");
        break;
      case "code":
        insertText("`", "`");
        break;
      case "quote":
        insertText("> ");
        break;
      case "h1":
        insertText("# ");
        break;
      case "h2":
        insertText("## ");
        break;
      case "h3":
        insertText("### ");
        break;
    }
  };

  const handleList = (type: "ul" | "ol") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split("\n");
      const formattedLines = lines.map((line) => {
        if (type === "ul") {
          return line.trim() ? `- ${line.trim()}` : line;
        } else {
          return line.trim() ? `1. ${line.trim()}` : line;
        }
      });

      const formattedText = formattedLines.join("\n");
      const newContent =
        content.substring(0, start) + formattedText + content.substring(end);
      setContent(newContent);
    } else {
      // If no text selected, just insert list marker
      insertText(type === "ul" ? "- " : "1. ");
    }
  };

  const handleLink = () => {
    if (linkUrl && linkText) {
      const linkMarkdown = `[${linkText}](${linkUrl})`;
      insertText(linkMarkdown);
      setShowLinkDialog(false);
      setLinkUrl("");
      setLinkText("");
    }
  };

  const handleImage = () => {
    if (imageUrl) {
      const imageMarkdown = `![${imageAlt}](${imageUrl})`;
      insertText(imageMarkdown);
      setShowImageDialog(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleUndo = () => {
    // Simple undo functionality
  };

  const handleRedo = () => {
    // Simple redo functionality
  };

  const handleSave = () => {
    // Save functionality
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("underline")}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("strikethrough")}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("code")}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("h1")}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("h2")}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("h3")}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Lists and Quotes */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleList("ul")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleList("ol")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("quote")}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>

          {/* Links and Media */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              title="Insert Image"
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        {/* Text Editor */}
        <div className="border-r">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 rounded-none resize-none focus:ring-0 font-mono text-sm"
          />
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Preview
          </div>
          <div
            className="prose prose-sm max-w-none min-h-[350px] p-3 border rounded bg-muted/20 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleLink} disabled={!linkUrl || !linkText}>
                Add Link
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleImage} disabled={!imageUrl}>
                Add Image
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { LexicalEditor };
export default LexicalEditor;
