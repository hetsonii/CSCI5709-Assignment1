import './ApartmentCard.css'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  'https://images.unsplash.com/photo-1555443805-658637491dd4?w=600&q=80',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&q=80',
]

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

function ApartmentCard({ apartment, index }) {
  const img = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]

  return (
    <div className="apt-card">
      <div className="apt-img-wrap">
        <img src={img} alt={apartment.name} className="apt-img" />
        <div className="apt-rating-badge">
          <span className="rating-star">★</span>
          {apartment.rating.toFixed(1)}
        </div>
      </div>
      <div className="apt-body">
        <h3 className="apt-name">{apartment.name}</h3>
        <p className="apt-address">
          <span className="pin">📍</span>
          {apartment.address} · {apartment.neighbourhood}
        </p>
        <div className="apt-tags">
          {apartment.tags.length > 0
            ? apartment.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))
            : <span className="tag tag-muted">No AI summary yet</span>
          }
        </div>
        <div className="apt-footer">
          <span className="review-count">{apartment.reviews} review{apartment.reviews !== 1 ? 's' : ''}</span>
          <Stars rating={apartment.rating} />
        </div>
      </div>
    </div>
  )
}

export default ApartmentCard
