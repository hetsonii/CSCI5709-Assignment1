import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import AISummary from "../components/AISummary";
import ReviewCard from "../components/ReviewCard";
import ReviewDialog from "../components/ReviewDialog";

/* ── Seed data ─────────────────────────────────────────────────────────── */
const APARTMENTS = {
  "le-marchant-towers": {
    id: "le-marchant-towers",
    name: "Le Marchant Towers",
    address: "1585 Le Marchant St · West End",
    description: "High-rise tower in a quiet residential neighbourhood.",
    landlord: "Killam Properties",
    units: 88,
    yearBuilt: 1975,
    neighbourhood: "West End",
    aiSummary:
      "Tenants consistently praise the location and proximity to Quinpool Road shops. Parking availability is a recurring complaint, with multiple reviewers mentioning waitlists exceeding six months. The building shows its age in hallway carpeting and elevator reliability, but unit interiors have been progressively updated. Maintenance response times average two to three days for non-urgent requests.",
    aiTags: ["Good location", "Parking limited", "Aging building", "Maintenance delays"],
    reviews: [
      {
        id: "r1",
        author: "James Chen",
        avatar: "JC",
        date: "Apr 1, 2026",
        rating: 4,
        text: "Good building overall. Management is professional and responsive within 48 hours for most issues. The parking situation is genuinely bad though. I waited five months for a spot.",
        comments: [
          { author: "Alex Mitchell", date: "Apr 4, 2026", text: "How long was the parking waitlist when you moved in?" },
        ],
      },
      {
        id: "r2",
        author: "Alex Mitchell",
        avatar: "AM",
        date: "Mar 19, 2026",
        rating: 4,
        text: "Lived here for two years. Quiet neighbours, solid construction, and the Quinpool Road location is extremely convenient. Elevator breaks down about once a month but they fix it within the day.",
        comments: [],
      },
    ],
    ratingBreakdown: { 5: 0, 4: 2, 3: 1, 2: 0, 1: 0 },
    avgRating: 3.7,
  },

  "the-marlstone": {
    id: "the-marlstone",
    name: "The Marlstone",
    address: "5540 Spring Garden Rd · Spring Garden",
    description: "Newly built mid-rise in the heart of the Spring Garden shopping district.",
    landlord: "Southwest Properties",
    units: 120,
    yearBuilt: 2022,
    neighbourhood: "Spring Garden",
    // Only one review so far — not enough data for an AI summary yet.
    aiSummary: "",
    aiTags: [],
    reviews: [
      {
        id: "r1",
        author: "Priya Nair",
        avatar: "PN",
        date: "May 12, 2026",
        rating: 5,
        text: "Brand new everything. In-suite laundry, fast elevators, and the location right on Spring Garden is unbeatable. Management answered my move-in questions same day. No complaints so far.",
        comments: [],
      },
    ],
    ratingBreakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
    avgRating: 5.0,
  },

  "park-victoria": {
    id: "park-victoria",
    name: "Park Victoria",
    address: "1496 Carlton St · South End",
    description: "Established South End building near the universities and hospitals.",
    landlord: "Templeton Properties",
    units: 64,
    yearBuilt: 1989,
    neighbourhood: "South End",
    aiSummary:
      "Tenants describe Park Victoria as well maintained and notably quiet, with thick walls and respectful neighbours cited repeatedly. The South End location near the hospitals and Dalhousie is a frequent draw. The main drawback is cost — multiple reviewers note rents are on the high end for the area, though most feel the upkeep justifies it.",
    aiTags: ["Well maintained", "Quiet", "Expensive"],
    reviews: [
      {
        id: "r1",
        author: "Daniel Okafor",
        avatar: "DO",
        date: "Apr 22, 2026",
        rating: 5,
        text: "Easily the quietest building I've lived in. Walls are solid, you never hear the neighbours. Maintenance is on top of things — reported a leaky faucet and it was fixed the next morning.",
        comments: [
          { author: "Sara Lund", date: "Apr 24, 2026", text: "Good to know about the maintenance. Is parking included?" },
        ],
      },
      {
        id: "r2",
        author: "Sara Lund",
        avatar: "SL",
        date: "Mar 30, 2026",
        rating: 4,
        text: "Great spot for walking to the hospital and Dal. The building is clean and well kept. Only knock is the rent — it's pricey compared to nearby places, but you do get what you pay for.",
        comments: [],
      },
    ],
    ratingBreakdown: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
    avgRating: 4.5,
  },

  "fenwick-tower": {
    id: "fenwick-tower",
    name: "Fenwick Tower",
    address: "5599 Fenwick St · Downtown",
    description: "Landmark high-rise offering panoramic harbour and city views.",
    landlord: "Templeton Properties",
    units: 320,
    yearBuilt: 1971,
    neighbourhood: "Downtown",
    aiSummary:
      "The views are the standout — upper-floor tenants rave about the harbour and city panoramas. Reliability is the recurring concern: elevator outages are mentioned across several reviews, a real issue in a building this tall. A few tenants also raised security concerns around the lobby and entry access. Renovated units are well regarded; older units less so.",
    aiTags: ["Elevator issues", "Great views", "Security concerns"],
    reviews: [
      {
        id: "r1",
        author: "Marcus Reid",
        avatar: "MR",
        date: "Apr 18, 2026",
        rating: 5,
        text: "The view from the 28th floor is incredible — you can see the whole harbour. Renovated unit is bright and modern. Genuinely love waking up to this.",
        comments: [],
      },
      {
        id: "r2",
        author: "Hana Suzuki",
        avatar: "HS",
        date: "Apr 5, 2026",
        rating: 3,
        text: "Mixed feelings. The views are amazing but with 320 units and only a couple of working elevators, the morning wait can be brutal when one is down. Happens more often than it should.",
        comments: [
          { author: "Marcus Reid", date: "Apr 6, 2026", text: "Which floor are you on? It's been better on the higher floors lately." },
        ],
      },
      {
        id: "r3",
        author: "Tom Beckett",
        avatar: "TB",
        date: "Mar 15, 2026",
        rating: 2,
        text: "Lobby door has been broken for weeks and anyone can walk in. Reported it twice. The location and views are good but the security situation makes me uneasy.",
        comments: [],
      },
    ],
    ratingBreakdown: { 5: 1, 4: 0, 3: 1, 2: 1, 1: 0 },
    avgRating: 3.3,
  },

  "southpoint-apartments": {
    id: "southpoint-apartments",
    name: "Southpoint Apartments",
    address: "1050 South Park St · South End",
    description: "Budget-friendly walk-up close to the Public Gardens and downtown.",
    landlord: "Capital District Rentals",
    units: 42,
    yearBuilt: 1968,
    neighbourhood: "South End",
    // No AI summary generated yet for this building.
    aiSummary: "",
    aiTags: [],
    reviews: [
      {
        id: "r1",
        author: "Emily Ford",
        avatar: "EF",
        date: "May 2, 2026",
        rating: 3,
        text: "Affordable and the location next to the Public Gardens is lovely. The unit itself is dated but functional. You get what you pay for here.",
        comments: [],
      },
      {
        id: "r2",
        author: "Raj Patel",
        avatar: "RP",
        date: "Apr 14, 2026",
        rating: 2,
        text: "Cheap rent is the main draw. Heating is inconsistent in winter and the laundry machines are often out of order. Maintenance takes a while to respond.",
        comments: [],
      },
      {
        id: "r3",
        author: "Chloe Benoit",
        avatar: "CB",
        date: "Mar 28, 2026",
        rating: 4,
        text: "For the price, it's honestly fine. Walls are a bit thin but the neighbours are friendly and the downtown access is great. Wouldn't expect luxury at this rent.",
        comments: [],
      },
      {
        id: "r4",
        author: "Victor Hughes",
        avatar: "VH",
        date: "Mar 10, 2026",
        rating: 1,
        text: "Had a persistent mould issue in the bathroom that took over a month to address. Frustrating experience with management. Looking to move when my lease is up.",
        comments: [],
      },
    ],
    ratingBreakdown: { 5: 0, 4: 1, 3: 1, 2: 1, 1: 1 },
    avgRating: 2.5,
  },
};

/* ── Rating breakdown bar ───────────────────────────────────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rating-bar">
      <span className="rating-bar__star">{star} ★</span>
      <div className="rating-bar__track">
        <div className="rating-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar__count">{count}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function ApartmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const apt = APARTMENTS[id];

  const [reviews, setReviews] = useState(apt?.reviews ?? []);
  const [showDialog, setShowDialog] = useState(false);

  if (!apt) {
    return (
      <div className="page-wrapper">
        <p>Apartment not found.</p>
        <Link to="/dashboard">← Back to apartments</Link>
      </div>
    );
  }

  const totalReviews = Object.values(apt.ratingBreakdown).reduce((a, b) => a + b, 0);

  function handleSubmitReview({ rating, text }) {
    const newReview = {
      id: `r${Date.now()}`,
      author: user?.name ?? "Anonymous",
      avatar: (user?.name ?? "A").slice(0, 2).toUpperCase(),
      date: new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }),
      rating,
      text,
      comments: [],
    };
    setReviews((prev) => [newReview, ...prev]);
    setShowDialog(false);
  }

  function handleComment(reviewId, text) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              comments: [
                ...r.comments,
                {
                  author: user?.name ?? "You",
                  date: new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }),
                  text,
                },
              ],
            }
          : r
      )
    );
  }

  return (
    <div className="page-wrapper">
      <Link to="/dashboard" className="back-link">← Back to all apartments</Link>

      {/* Apartment header */}
      <div className="apt-header card">
        <div className="apt-header__info">
          <h1 className="apt-header__name">{apt.name}</h1>
          <p className="apt-header__address">📍 {apt.address}</p>
          <p className="apt-header__desc">{apt.description}</p>
        </div>
        <div className="apt-header__score">
          <span className="apt-header__avg">{apt.avgRating.toFixed(1)}</span>
          <StarRating value={Math.round(apt.avgRating)} size="md" />
          <span className="apt-header__review-count">{totalReviews} reviews</span>
        </div>
      </div>

      <div className="apt-detail-layout">
        {/* Left column */}
        <div className="apt-detail-layout__main">
          <AISummary summary={apt.aiSummary} tags={apt.aiTags} />

          <div className="reviews-section">
            <div className="reviews-section__header">
              <h2 className="reviews-section__title">Reviews ({reviews.length})</h2>
              {user && (
                <button className="btn btn--outline" onClick={() => setShowDialog(true)}>
                  + Write a Review
                </button>
              )}
            </div>

            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                currentUser={user?.name}
                onComment={handleComment}
              />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="apt-detail-layout__sidebar">
          <div className="card sidebar-card">
            <h3 className="sidebar-card__title">Property Info</h3>
            <dl className="property-info">
              <dt>Landlord</dt><dd>{apt.landlord}</dd>
              <dt>Units</dt><dd>{apt.units}</dd>
              <dt>Year built</dt><dd>{apt.yearBuilt}</dd>
              <dt>Neighbourhood</dt><dd>{apt.neighbourhood}</dd>
            </dl>
          </div>

          <div className="card sidebar-card">
            <h3 className="sidebar-card__title">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar key={s} star={s} count={apt.ratingBreakdown[s]} total={totalReviews} />
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
  );
}