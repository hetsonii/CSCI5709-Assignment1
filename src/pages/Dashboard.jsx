import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apartmentsApi } from '../utils/api'
import ApartmentCard from '../components/ApartmentCard.jsx'
import './Dashboard.css'

const NEIGHBOURHOODS = ['All Neighbourhoods', 'Spring Garden', 'South End', 'West End', 'Downtown']
const SORT_OPTIONS = ['Highest Rated', 'Most Reviews', 'Lowest Rated']

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [neighbourhood, setNeighbourhood] = useState('All Neighbourhoods')
  const [sort, setSort] = useState('Highest Rated')

  useEffect(() => {
    apartmentsApi.list()
      .then(({ apartments }) => setApartments(apartments))
      .catch(() => setError('Could not load apartments. Is the server running?'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = apartments
    .filter((a) => {
      const q = search.toLowerCase()
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q) ||
        a.neighbourhood.toLowerCase().includes(q)
      const matchesNeighbourhood =
        neighbourhood === 'All Neighbourhoods' || a.neighbourhood === neighbourhood
      return matchesSearch && matchesNeighbourhood
    })
    .sort((a, b) => {
      if (sort === 'Highest Rated') return b.avgRating - a.avgRating
      if (sort === 'Lowest Rated') return a.avgRating - b.avgRating
      if (sort === 'Most Reviews') return b.reviewCount - a.reviewCount
      return 0
    })

  const totalReviews = apartments.reduce((s, a) => s + parseInt(a.reviewCount || 0), 0)
  const uniqueNeighbourhoods = [...new Set(apartments.map(a => a.neighbourhood))].length

  const handleLogout = async () => { await logout(); navigate('/') }
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <span className="logo" onClick={() => navigate('/')}>TenantTrails</span>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search apartments by address or neighbourhood..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="dash-user">
          <Link to="/profile" className="dash-user__profile-link" title="View profile">
            <div className="avatar">{userInitials}</div>
            <span className="username">{user?.name || 'User'}</span>
          </Link>
          <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-header">
          <h1 className="dash-title">Apartments in Halifax</h1>
          <p className="dash-sub">Honest reviews from real tenants. Read before you rent.</p>

          <div className="stats-pills">
            <span className="stat-pill">{apartments.length} apartments</span>
            <span className="stat-pill">{totalReviews} reviews</span>
            <span className="stat-pill">{uniqueNeighbourhoods} neighbourhoods</span>
          </div>

          <div className="filters">
            <select className="filter-select" value={neighbourhood} onChange={e => setNeighbourhood(e.target.value)}>
              {NEIGHBOURHOODS.map(n => <option key={n}>{n}</option>)}
            </select>
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && <p className="loading-state">Loading apartments…</p>}
        {error && <p className="error-state">{error}</p>}

        {!loading && !error && (
          <div className="apt-grid">
            {filtered.map((apt, i) => (
              <ApartmentCard
                key={apt.id}
                apartment={{
                  id: apt.slug,          // slug used for navigation
                  name: apt.name,
                  address: apt.address,
                  neighbourhood: apt.neighbourhood,
                  rating: apt.avgRating,     // aliased field
                  reviews: apt.reviewCount,   // aliased field
                  tags: apt.tags || [],
                }}
                index={i}
              />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">No apartments match your search.</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard