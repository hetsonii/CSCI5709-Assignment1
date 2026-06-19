import StarRating from "./StarRating";

/**
 * ReviewCard component
 * Props:
 *   review  - { id, author, avatar, date, rating, text, imageUrl, comments }
 *   currentUser - username of the logged-in user (to show reply box)
 *   onComment   - fn(reviewId, text) called when user submits a comment
 */
export default function ReviewCard({ review, currentUser, onComment }) {
  const { id, author, avatar, date, rating, text, imageUrl, comments = [] } = review;

  function handleReply(e) {
    e.preventDefault();
    const input = e.target.elements.comment;
    if (!input.value.trim()) return;
    onComment?.(id, input.value.trim());
    input.value = "";
  }

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">{avatar}</div>
        <div className="review-card__meta">
          <span className="review-card__author">
            {author}
            {author === currentUser ? " (you)" : ""}
          </span>
          <span className="review-card__date">{date}</span>
        </div>
        <StarRating value={rating} size="sm" />
      </div>

      <p className="review-card__text">{text}</p>

      {/* ── Attached image ──────────────────────────────────── */}
      {imageUrl && (
        <div className="review-card__image-wrap">
          <img
            src={imageUrl}
            alt="Review attachment"
            className="review-card__image"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      {/* ── Comments ────────────────────────────────────────── */}
      {comments.length > 0 && (
        <div className="review-card__comments">
          <span className="review-card__comments-toggle">
            💬 {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </span>
          {comments.map((c, i) => (
            <div key={i} className="review-card__comment">
              <strong>{c.author}</strong>
              <span className="review-card__comment-date">{c.date}</span>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Reply box ───────────────────────────────────────── */}
      {currentUser && (
        <form className="review-card__reply" onSubmit={handleReply}>
          <input
            name="comment"
            className="review-card__reply-input"
            placeholder="Write a comment..."
          />
          <button type="submit" className="btn btn--primary btn--sm">
            Reply
          </button>
        </form>
      )}
    </div>
  );
}