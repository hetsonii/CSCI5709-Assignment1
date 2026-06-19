import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi, apartmentsApi } from '../utils/api'
import StarRating from '../components/StarRating'
import ReviewDialog from '../components/ReviewDialog'

export default function Profile() {
  const { user } = useAuth()

  const [reviews,     setReviews]     = useState([])
  const [stats,       setStats]       = useState({ review_count: 0, comment_count: 0 })
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [editTarget,  setEditTarget]  = useState(null)
  const [deleteTarget,setDeleteTarget]= useState(null)

  useEffect(() => {
    profileApi.get()
      .then(({ reviews, stats }) => {
        setReviews(reviews)
        setStats(stats)
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveEdit({ rating, text }) {
    const { review } = await apartmentsApi.updateReview(
      editTarget.apartment_slug,
      editTarget.review_id,
      { rating, body: text }
    )
    setReviews(prev =>
      prev.map(r => r.review_id === editTarget.review_id
        ? { ...r, rating: review.rating, body: review.body }
        : r
      )
    )
    setEditTarget(null)
  }

  async function confirmDelete(reviewId, apartmentSlug) {
    await apartmentsApi.deleteReview(apartmentSlug, reviewId)
    setReviews(prev => prev.filter(r => r.review_id !== reviewId))
    setStats(prev => ({ ...prev, review_count: prev.review_count - 1 }))
    setDeleteTarget(null)
  }

  if (!user)    return <div className="page-wrapper"><p>Please <Link to="/login">log in</Link>.</p></div>
  if (loading)  return <div className="page-wrapper"><p>Loading…</p></div>
  if (error)    return <div className="page-wrapper"><p>{error}</p></div>

  return (
    <div className="page-wrapper">
      <Link to="/dashboard" className="back-link">← Back to apartments</Link>

      <div className="card profile-header">
        <div className="profile-header__avatar">{user.name?.slice(0, 2).toUpperCase() ?? 'U'}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{user.name}</h1>
          <p className="profile-header__email">{user.email}</p>
        </div>
        <div className="profile-header__stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.review_count}</span>
            <span className="profile-stat__label">REVIEWS</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.comment_count}</span>
            <span className="profile-stat__label">COMMENTS</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Your Reviews</h2>

      {reviews.length === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          You haven't written any reviews yet.
        </div>
      )}

      {reviews.map(review => (
        <div key={review.review_id} className="card profile-review">
          <div className="profile-review__main">
            <Link to={`/apartment/${review.apartment_slug}`} className="profile-review__apt">
              {review.apartment_name}
            </Link>
            <StarRating value={review.rating} size="sm" />
            <p className="profile-review__text">{review.body}</p>
          </div>
          <div className="profile-review__actions">
            <Link to={`/apartment/${review.apartment_slug}`} className="btn btn--ghost btn--sm">View</Link>
            <button className="btn btn--outline btn--sm" onClick={() => setEditTarget(review)}>Edit</button>
            <button className="btn btn--danger btn--sm"  onClick={() => setDeleteTarget(review)}>Delete</button>
          </div>
        </div>
      ))}

      {editTarget && (
        <ReviewDialog
          mode="edit"
          initialData={{ rating: editTarget.rating, text: editTarget.body }}
          onSubmit={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

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
              <button className="btn btn--ghost"  onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => confirmDelete(deleteTarget.review_id, deleteTarget.apartment_slug)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}