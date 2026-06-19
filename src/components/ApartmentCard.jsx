import { useNavigate } from 'react-router-dom'
import './ApartmentCard.css'

function StarDisplay({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(rating) ? '#f5a623' : '#d1d5db' }}>
          ★
        </span>
      ))}
    </span>
  )
}

function ApartmentCard({ apartment, index }) {
  const navigate = useNavigate()

  // Support both slug-based ids (strings) and numeric ids
  const destination = `/apartment/${apartment.id || apartment.slug}`

  return (
    <div
      className="apt-card"
      onClick={() => navigate(destination)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(destination)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="apt-card__body">
        <h3 className="apt-card__name">{apartment.name}</h3>
        <p className="apt-card__address">{apartment.address}</p>
        <span className="apt-card__neighbourhood">{apartment.neighbourhood}</span>

        {apartment.tags && apartment.tags.length > 0 && (
          <div className="apt-card__tags">
            {apartment.tags.map((tag) => (
              <span key={tag} className="apt-card__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="apt-card__footer">
        <div className="apt-card__rating">
          <StarDisplay rating={apartment.rating ?? apartment.avg_rating ?? 0} />
          <span className="apt-card__rating-num">
            {parseFloat(apartment.rating ?? apartment.avg_rating ?? 0).toFixed(1)}
          </span>
        </div>
        <span className="apt-card__reviews">
          {apartment.reviews ?? apartment.review_count ?? 0} review
          {(apartment.reviews ?? apartment.review_count ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default ApartmentCard