import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApartmentCard from '../components/ApartmentCard.jsx'
import './Dashboard.css'

const APARTMENTS = [
  {
    id: 1,
    name: 'The Marlstone',
    address: '5540 Spring Garden Rd',
    neighbourhood: 'Spring Garden',
    rating: 5.0,
    reviews: 1,
    tags: [],
  },
  {
    id: 2,
    name: 'Park Victoria',
    address: '1496 Carlton St',
    neighbourhood: 'South End',
    rating: 4.5,
    reviews: 2,
    tags: ['Well maintained', 'Quiet', 'Expensive'],
  },
  {
    id: 3,
    name: 'Le Marchant Towers',
    address: '1585 Le Marchant St',
    neighbourhood: 'West End',
    rating: 3.7,
    reviews: 3,
    tags: ['Good location', 'Parking limited', 'Aging building'],
  },
  {
    id: 4,
    name: 'Fenwick Tower',
    address: '5599 Fenwick St',
    neighbourhood: 'Downtown',
    rating: 3.3,
    reviews: 3,
    tags: ['Elevator issues', 'Great views', 'Security concerns'],
  },
  {
    id: 5,
    name: 'Southpoint Apartments',
    address: '1050 South Park St',
    neighbourhood: 'South End',
    rating: 2.5,
    reviews: 4,
    tags: [],
  },
]

const NEIGHBOURHOODS = ['All Neighbourhoods', 'Spring Garden', 'South End', 'West End', 'Downtown']
const SORT_OPTIONS = ['Highest Rated', 'Most Reviews', 'Lowest Rated']

function Dashboard() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [neighbourhood, setNeighbourhood] = useState('All Neighbourhoods')
  const [sort, setSort] = useState('Highest Rated')

  const filtered = APARTMENTS
    .filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.address.toLowerCase().includes(search.toLowerCase()) ||
        a.neighbourhood.toLowerCase().includes(search.toLowerCase())
      const matchesNeighbourhood =
        neighbourhood === 'All Neighbourhoods' || a.neighbourhood === neighbourhood
      return matchesSearch && matchesNeighbourhood
    })
    .sort((a, b) => {
      if (sort === 'Highest Rated') return b.rating - a.rating
      if (sort === 'Lowest Rated') return a.rating - b.rating
      if (sort === 'Most Reviews') return b.reviews - a.reviews
      return 0
    })

  const totalReviews = APARTMENTS.reduce((s, a) => s + a.reviews, 0)
  const uniqueNeighbourhoods = [...new Set(APARTMENTS.map((a) => a.neighbourhood))].length

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dash-nav">
        <span className="logo" onClick={() => navigate('/')}>TenantTrails</span>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search apartments by address or neighbourhood..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="dash-user">
          <div className="avatar">AM</div>
          <span className="username">Alex</span>
          <button className="btn-ghost" onClick={() => navigate('/')}>Sign out</button>
        </div>
      </nav>

      {/* Content */}
      <main className="dash-main">
        <div className="dash-header">
          <h1 className="dash-title">Apartments in Halifax</h1>
          <p className="dash-sub">Honest reviews from real tenants. Read before you rent.</p>

          <div className="stats-pills">
            <span className="stat-pill">{APARTMENTS.length} apartments</span>
            <span className="stat-pill">{totalReviews} reviews</span>
            <span className="stat-pill">{uniqueNeighbourhoods} neighbourhoods</span>
          </div>

          <div className="filters">
            <select
              className="filter-select"
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
            >
              {NEIGHBOURHOODS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="apt-grid">
          {filtered.map((apt, i) => (
            <ApartmentCard key={apt.id} apartment={apt} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">No apartments match your search.</div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
