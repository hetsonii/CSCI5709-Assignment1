import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apartmentsApi, uploadApi } from '../utils/api'
import StarRating from '../components/StarRating'
import AISummary from '../components/AISummary'
import ReviewCard from '../components/ReviewCard'
import ReviewDialog from '../components/ReviewDialog'

function RatingBar({ star, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div className="rating-bar">
      <span className="rating-bar__star">{star} ★</span>
      <div className="rating-bar__track">
        <div className="rating-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar__count">{count}</span>
    </div>
  )
}

export default function ApartmentDetail() {
  const { id: slug } = useParams()
  const { user } = useAuth()

  const [apartment, setApartment] = useState(null)
  const [reviews, setReviews] = useState([])
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    setLoading(true)
    apartmentsApi.get(slug)
      .then(({ apartment, reviews, ratingBreakdown }) => {
        setApartment(apartment)
        setReviews(reviews)
        setRatingBreakdown(ratingBreakdown)
      })
      .catch(() => setError('Failed to load apartment.'))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleSubmitReview({ rating, text, file }) {
    let imageUrl = null
    if (file) {
      try {
        const uploaded = await uploadApi.upload(file)
        imageUrl = uploaded.url
      } catch {
        // non-fatal — continue without image
      }
    }
    // API now expects imageUrl (camelCase) to match aliased field
    const { review } = await apartmentsApi.addReview(slug, { rating, body: text, imageUrl })
    setReviews(prev => [review, ...prev])
    setRatingBreakdown(prev => ({ ...prev, [rating]: (prev[rating] || 0) + 1 }))
    setShowDialog(false)
  }

  async function handleComment(reviewId, text) {
    const { comment } = await apartmentsApi.addComment(slug, reviewId, text)
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? { ...r, comments: [...r.comments, comment] }
          : r
      )
    )
  }

  if (loading) return <div className="page-wrapper"><p>Loading…</p></div>
  if (error) return <div className="page-wrapper"><p>{error}</p><Link to="/dashboard">← Back</Link></div>
  if (!apartment) return null

  const totalReviews = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="page-wrapper">
      <Link to="/dashboard" className="back-link">← Back to all apartments</Link>

      <div className="apt-header card">
        <div className="apt-header__info">
          <h1 className="apt-header__name">{apartment.name}</h1>
          <p className="apt-header__address">📍 {apartment.address}</p>
          <p className="apt-header__desc">{apartment.description}</p>
        </div>
        <div className="apt-header__score">
          {/* avgRating is the aliased field from the API */}
          <span className="apt-header__avg">{parseFloat(apartment.avgRating).toFixed(1)}</span>
          <StarRating value={Math.round(apartment.avgRating)} size="md" />
          <span className="apt-header__review-count">{totalReviews} reviews</span>
        </div>
      </div>

      <div className="apt-detail-layout">
        <div className="apt-detail-layout__main">
          <AISummary summary={apartment.aiSummary} tags={[]} />

          <div className="reviews-section">
            <div className="reviews-section__header">
              <h2 className="reviews-section__title">Reviews ({reviews.length})</h2>
              {user && (
                <button className="btn btn--outline" onClick={() => setShowDialog(true)}>
                  + Write a Review
                </button>
              )}
            </div>

            {reviews.map(r => (
              <ReviewCard
                key={r.id}
                review={{
                  id: r.id,               // aliased from review_id
                  author: r.author,
                  avatar: r.author?.slice(0, 2).toUpperCase(),
                  date: new Date(r.createdAt).toLocaleDateString('en-CA', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  }),
                  rating: r.rating,
                  text: r.text,             // aliased from body
                  imageUrl: r.imageUrl,         // aliased from image_url
                  comments: (r.comments || []).map(c => ({
                    author: c.author,
                    date: new Date(c.createdAt).toLocaleDateString('en-CA', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    }),
                    text: c.text,             // aliased from body
                  })),
                }}
                currentUser={user?.name}
                onComment={handleComment}
              />
            ))}

            {reviews.length === 0 && (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No reviews yet. Be the first!</p>
            )}
          </div>
        </div>

        <aside className="apt-detail-layout__sidebar">
          <div className="card sidebar-card">
            <h3 className="sidebar-card__title">Property Info</h3>
            <dl className="property-info">
              <dt>Landlord</dt>     <dd>{apartment.landlord}</dd>
              <dt>Units</dt>        <dd>{apartment.units}</dd>
              <dt>Year built</dt>   <dd>{apartment.yearBuilt}</dd>
              <dt>Neighbourhood</dt><dd>{apartment.neighbourhood}</dd>
            </dl>
          </div>

          <div className="card sidebar-card">
            <h3 className="sidebar-card__title">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} star={s} count={ratingBreakdown[s] || 0} total={totalReviews} />
            ))}
          </div>

          {user && (
            <button className="btn btn--primary btn--full" onClick={() => setShowDialog(true)}>
              Write a Review
            </button>
          )}
        </aside>
      </div>

      {showDialog && (
        <ReviewDialog
          mode="write"
          onSubmit={handleSubmitReview}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  )
}