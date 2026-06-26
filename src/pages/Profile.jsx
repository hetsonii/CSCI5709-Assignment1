import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi, apartmentsApi } from '../utils/api'
import StarRating from '../components/StarRating'
import ReviewDialog from '../components/ReviewDialog'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [reviews,      setReviews]      = useState([])
  const [stats,        setStats]        = useState({ reviewCount: 0, commentCount: 0 })
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [showEditProfile,   setShowEditProfile]   = useState(false)
  const [profileForm,       setProfileForm]       = useState({ name: '', currentPassword: '', newPassword: '' })
  const [profileError,      setProfileError]      = useState('')
  const [profileSaving,     setProfileSaving]     = useState(false)

  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deletePassword,    setDeletePassword]    = useState('')
  const [deleteError,       setDeleteError]       = useState('')
  const [deleteLoading,     setDeleteLoading]     = useState(false)

  useEffect(() => {
    profileApi.get()
      .then(({ reviews, stats }) => {
        setReviews(reviews)
        setStats(stats)
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Edit review ──────────────────────────────────────────────
  async function handleSaveEdit({ rating, text }) {
    try {
      const { review } = await apartmentsApi.updateReview(
        editTarget.apartmentSlug,
        editTarget.id,
        { rating, body: text }
      )
      setReviews(prev =>
        prev.map(r => r.id === editTarget.id
          ? { ...r, rating: review.rating, text: review.text }
          : r
        )
      )
      setEditTarget(null)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Delete review ────────────────────────────────────────────
  async function confirmDeleteReview(id, apartmentSlug) {
    try {
      await apartmentsApi.deleteReview(apartmentSlug, id)
      setReviews(prev => prev.filter(r => r.id !== id))
      setStats(prev => ({ ...prev, reviewCount: prev.reviewCount - 1 }))
      setDeleteTarget(null)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Update profile ───────────────────────────────────────────
  async function handleUpdateProfile(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const payload = {}
      if (profileForm.name.trim())     payload.name = profileForm.name.trim()
      if (profileForm.newPassword)     payload.newPassword = profileForm.newPassword
      if (profileForm.currentPassword) payload.currentPassword = profileForm.currentPassword
      await profileApi.update(payload)
      setShowEditProfile(false)
      setProfileForm({ name: '', currentPassword: '', newPassword: '' })
      const { reviews: r, stats: s } = await profileApi.get()
      setReviews(r)
      setStats(s)
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Delete account ───────────────────────────────────────────
  async function handleDeleteAccount(e) {
    e.preventDefault()
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await profileApi.delete({ password: deletePassword })
      await logout()
      navigate('/')
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!user)   return <div className="page-wrapper"><p>Please <Link to="/login">log in</Link>.</p></div>
  if (loading) return <div className="page-wrapper"><p>Loading…</p></div>
  if (error)   return <div className="page-wrapper"><p className="error-state">{error}</p></div>

  return (
    <div className="page-wrapper">
      <Link to="/dashboard" className="back-link">← Back to apartments</Link>

      {/* ── Profile header ─────────────────────────────────── */}
      <div className="card profile-header">
        <div className="profile-header__avatar">{user.name?.slice(0, 2).toUpperCase() ?? 'U'}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{user.name}</h1>
          <p className="profile-header__email">{user.email}</p>
        </div>
        <div className="profile-header__stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.reviewCount}</span>
            <span className="profile-stat__label">REVIEWS</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.commentCount}</span>
            <span className="profile-stat__label">COMMENTS</span>
          </div>
        </div>
      </div>

      {/* ── Profile actions ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className="btn btn--outline btn--sm" onClick={() => setShowEditProfile(true)}>
          Edit Profile
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => setShowDeleteAccount(true)}>
          Delete Account
        </button>
      </div>

      {/* ── Reviews ───────────────────────────────────────── */}
      <h2 className="section-title">Your Reviews</h2>

      {reviews.length === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          You haven't written any reviews yet.
        </div>
      )}

      {reviews.map(review => (
        <div key={review.id} className="card profile-review">
          <div className="profile-review__main">
            <Link to={`/apartment/${review.apartmentSlug}`} className="profile-review__apt">
              {review.apartmentName}
            </Link>
            <StarRating value={review.rating} size="sm" />
            <p className="profile-review__text">{review.text}</p>

            {/* ── Review image ──────────────────────────── */}
            {review.imageUrl && (
              <div className="review-card__image-wrap">
                <img
                  src={review.imageUrl}
                  alt="Review attachment"
                  className="review-card__image"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          <div className="profile-review__actions">
            <Link to={`/apartment/${review.apartmentSlug}`} className="btn btn--ghost btn--sm">View</Link>
            <button className="btn btn--outline btn--sm" onClick={() => setEditTarget(review)}>Edit</button>
            <button className="btn btn--danger btn--sm"  onClick={() => setDeleteTarget(review)}>Delete</button>
          </div>
        </div>
      ))}

      {/* ── Edit review dialog ────────────────────────────── */}
      {editTarget && (
        <ReviewDialog
          mode="edit"
          initialData={{ rating: editTarget.rating, text: editTarget.text }}
          onSubmit={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* ── Delete review confirm ─────────────────────────── */}
      {deleteTarget && (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
          <div className="dialog dialog--sm">
            <div className="dialog__header">
              <h2 className="dialog__title">Delete Review</h2>
            </div>
            <div className="dialog__body">
              <p>Are you sure you want to delete this review? This cannot be undone.</p>
            </div>
            <div className="dialog__footer">
              <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => confirmDeleteReview(deleteTarget.id, deleteTarget.apartmentSlug)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit profile dialog ───────────────────────────── */}
      {showEditProfile && (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
          <div className="dialog">
            <div className="dialog__header">
              <h2 className="dialog__title">Edit Profile</h2>
              <button className="dialog__close" onClick={() => { setShowEditProfile(false); setProfileError('') }}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="dialog__body">
                {profileError && <p className="dialog__error">{profileError}</p>}
                <label className="dialog__label">New display name</label>
                <input
                  className="dialog__textarea"
                  style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                  type="text"
                  placeholder={user.name}
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                />
                <label className="dialog__label" style={{ marginTop: '1rem' }}>Current password</label>
                <input
                  className="dialog__textarea"
                  style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                  type="password"
                  placeholder="Required only when changing password"
                  value={profileForm.currentPassword}
                  onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                />
                <label className="dialog__label" style={{ marginTop: '1rem' }}>New password</label>
                <input
                  className="dialog__textarea"
                  style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={profileForm.newPassword}
                  onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div className="dialog__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowEditProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete account dialog ─────────────────────────── */}
      {showDeleteAccount && (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
          <div className="dialog dialog--sm">
            <div className="dialog__header">
              <h2 className="dialog__title">Delete Account</h2>
              <button className="dialog__close" onClick={() => { setShowDeleteAccount(false); setDeleteError('') }}>✕</button>
            </div>
            <form onSubmit={handleDeleteAccount}>
              <div className="dialog__body">
                <p style={{ color: '#374151', marginBottom: '1rem' }}>
                  This will permanently delete your account, all your reviews, and all your comments.
                  This action <strong>cannot be undone</strong>.
                </p>
                {deleteError && <p className="dialog__error">{deleteError}</p>}
                <label className="dialog__label">Enter your password to confirm</label>
                <input
                  className="dialog__textarea"
                  style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  required
                />
              </div>
              <div className="dialog__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowDeleteAccount(false)}>Cancel</button>
                <button type="submit" className="btn btn--danger" disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting…' : 'Delete My Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}