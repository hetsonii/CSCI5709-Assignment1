import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import ReviewDialog from "../components/ReviewDialog";

/* ── Seed data for Alex Mitchell ─────────────────────────────────────── */
const SEED_REVIEWS = [
  {
    id: "p1",
    apartment: "Southpoint Apartments",
    aptId: "southpoint-apartments",
    rating: 3,
    text: "Decent location near the park but the building has issues. Heater in my unit broke during winter and it took four days to fix. Deposit was returned in full though, which I appreciated.",
  },
  {
    id: "p2",
    apartment: "Southpoint Apartments",
    aptId: "southpoint-apartments",
    rating: 3,
    text: "Average experience overall. The laundry room is always busy and half the machines are broken. Common areas are cleaned occasionally.",
  },
  {
    id: "p3",
    apartment: "Le Marchant Towers",
    aptId: "le-marchant-towers",
    rating: 4,
    text: "Lived here for two years. Quiet neighbours, solid construction, and the Quinpool Road location is extremely convenient. Elevator breaks down about once a month but they fix it within the day.",
  },
  {
    id: "p4",
    apartment: "Fenwick Tower",
    aptId: "fenwick-tower",
    rating: 4,
    text: "The view from the 28th floor is incredible. You can see the harbour, Dartmouth, and McNabs Island. Location is unbeatable.",
  },
  {
    id: "p5",
    apartment: "Fenwick Tower",
    aptId: "fenwick-tower",
    rating: 4,
    text: "Rent is very reasonable for downtown Halifax. The unit itself is fine, nothing fancy but functional. Laundry facilities are decent.",
  },
  {
    id: "p6",
    apartment: "Park Victoria",
    aptId: "park-victoria",
    rating: 4,
    text: "Great management team and very clean building. Parking is included which is rare. Would recommend to anyone looking in the North End.",
  },
];

const SEED_COMMENT_COUNT = 3;

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function Profile() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [editTarget, setEditTarget] = useState(null); // review being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // review pending delete confirm

  function handleEdit(review) {
    setEditTarget(review);
  }

  function handleSaveEdit({ rating, text }) {
    setReviews((prev) =>
      prev.map((r) => (r.id === editTarget.id ? { ...r, rating, text } : r))
    );
    setEditTarget(null);
  }

  function confirmDelete(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeleteTarget(null);
  }

  if (!user) {
    return (
      <div className="page-wrapper">
        <p>Please <Link to="/login">log in</Link> to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Link to="/dashboard" className="back-link">← Back to apartments</Link>

      {/* Profile header */}
      <div className="card profile-header">
        <div className="profile-header__avatar">{user.name?.slice(0, 2).toUpperCase() ?? "U"}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{user.name}</h1>
          <p className="profile-header__email">{user.email}</p>
        </div>
        <div className="profile-header__stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{reviews.length}</span>
            <span className="profile-stat__label">REVIEWS</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{SEED_COMMENT_COUNT}</span>
            <span className="profile-stat__label">COMMENTS</span>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <h2 className="section-title">Your Reviews</h2>

      {reviews.length === 0 && (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          You haven't written any reviews yet.
        </div>
      )}

      {reviews.map((review) => (
        <div key={review.id} className="card profile-review">
          <div className="profile-review__main">
            <Link to={`/apartment/${review.aptId}`} className="profile-review__apt">
              {review.apartment}
            </Link>
            <StarRating value={review.rating} size="sm" />
            <p className="profile-review__text">{review.text}</p>
          </div>
          <div className="profile-review__actions">
            <Link to={`/apartment/${review.aptId}`} className="btn btn--ghost btn--sm">View</Link>
            <button className="btn btn--outline btn--sm" onClick={() => handleEdit(review)}>Edit</button>
            <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(review.id)}>Delete</button>
          </div>
        </div>
      ))}

      {/* Edit dialog */}
      {editTarget && (
        <ReviewDialog
          mode="edit"
          initialData={{ rating: editTarget.rating, text: editTarget.text }}
          onSubmit={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
          <div className="dialog dialog--sm">
            <div className="dialog__header">
              <h2 className="dialog__title">Delete Review</h2>
            </div>
            <div className="dialog__body">
              <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            </div>
            <div className="dialog__footer">
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => confirmDelete(deleteTarget)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}