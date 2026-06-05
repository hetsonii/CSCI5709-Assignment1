import { useState, useEffect } from "react";
import StarRating from "./StarRating";

/**
 * ReviewDialog component
 * Props:
 *   mode        - 'write' | 'edit'
 *   initialData - { rating, text } – pre-fill when editing
 *   onSubmit    - fn({ rating, text, file }) called on confirm
 *   onClose     - fn() called on cancel or X
 */
export default function ReviewDialog({ mode = "write", initialData = {}, onSubmit, onClose }) {
  const [rating, setRating] = useState(initialData.rating ?? 0);
  const [text, setText] = useState(initialData.text ?? "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // Re-sync when initialData changes (e.g. different edit target)
  useEffect(() => {
    setRating(initialData.rating ?? 0);
    setText(initialData.text ?? "");
    setFile(null);
    setError("");
  }, [initialData.rating, initialData.text]);

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (text.trim().length < 10) {
      setError("Your review must be at least 10 characters.");
      return;
    }
    setError("");
    onSubmit?.({ rating, text: text.trim(), file });
  }

  const isWrite = mode === "write";
  const title = isWrite ? "Write a Review" : "Edit Review";
  const submitLabel = isWrite ? "Submit Review" : "Save Changes";

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog">
        <div className="dialog__header">
          <h2 id="dialog-title" className="dialog__title">{title}</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="dialog__body">
          {/* Star rating */}
          <label className="dialog__label">Your rating</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="dialog__rating-label">{rating} of 5</span>
            )}
            {rating === 0 && (
              <span className="dialog__rating-label" style={{ color: "#9ca3af" }}>Click to rate</span>
            )}
          </div>

          {/* Review text */}
          <label className="dialog__label" style={{ marginTop: "1rem" }}>Your review</label>
          <textarea
            className="dialog__textarea"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What was your experience living here? Cover maintenance, responsiveness, noise, pests, deposit handling, and anything future tenants should know."
          />

          {/* Media upload – write mode only */}
          {isWrite && (
            <>
              <label className="dialog__label" style={{ marginTop: "1rem" }}>
                Attach photos or videos (optional)
              </label>
              <label className="dialog__upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,video/mp4"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <span className="dialog__upload-name">📎 {file.name}</span>
                ) : (
                  <>
                    <span className="dialog__upload-icon">🖇</span>
                    <span className="dialog__upload-text">Click to upload</span>
                    <span className="dialog__upload-hint">JPG, PNG, MP4 up to 10MB</span>
                  </>
                )}
              </label>
            </>
          )}

          {/* Validation error */}
          {error && <p className="dialog__error">{error}</p>}
        </div>

        <div className="dialog__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}