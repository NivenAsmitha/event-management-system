import React, { useState } from "react";
import {
  Upload,
  Tag,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function PhotographerUploadPage() {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleFiles = (fileList) => setFiles(Array.from(fileList || []));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (!files.length) {
      setStatus({ type: "error", msg: "Please choose at least 1 image." });
      return;
    }

    try {
      setSubmitting(true);
      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Upload each file; backend should default status=pending
      await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("title", title || file.name);
          fd.append("tags", JSON.stringify(tagArr));
          fd.append("authorRole", "photographer");

          const res = await fetch(`${API_BASE}/api/photos`, {
            method: "POST",
            body: fd,
            // headers: { Authorization: `Bearer ${token}` }  // if needed
          });
          if (!res.ok) throw new Error("Upload failed");
        })
      );

      setStatus({ type: "success", msg: "Submitted to Admin for approval." });
      setFiles([]);
      setTitle("");
      setTags("");
    } catch (err) {
      setStatus({
        type: "error",
        msg: err?.message || "Upload failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <ImagePlus className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Photographer Upload</h1>
        </div>

        {status.msg && (
          <div
            className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {status.msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Reception Highlights"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="wedding, dance, family"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="w-full border rounded-xl px-4 py-3"
            />
            {!!files.length && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden border border-gray-100"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-28 object-cover"
                    />
                    <div className="px-2 py-1 text-xs text-gray-600 truncate">
                      {f.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Submit to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
