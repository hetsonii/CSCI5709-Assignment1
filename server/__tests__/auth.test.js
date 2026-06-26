/**
 * TenantTrails – API tests
 * Run: npm test  (inside /server)
 * Requires Docker MySQL container running with seeded data.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const request = require('supertest')
const app = require('../index')
const pool = require('../config/db')

const TEST_EMAIL = `jest_${Date.now()}@test.com`
const TEST_PASSWORD = 'TestPass123'
const TEST_NAME = 'Jest User'

let agent         // supertest agent persists cookies between requests
let createdUserId

beforeAll(() => {
  // agent automatically stores and resends the Set-Cookie header
  agent = request.agent(app)
})

afterAll(async () => {
  if (createdUserId) {
    await pool.query('DELETE FROM users WHERE user_id = ?', [createdUserId])
  }
  await pool.end()
})

// ─────────────────────────────────────────────────────────────
// Auth – Signup
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  it('creates a user, sets httpOnly cookie, returns aliased user', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('id')          // aliased from user_id
    expect(res.body.user).toHaveProperty('createdAt')   // aliased from created_at
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body.user).not.toHaveProperty('user_id')
    expect(res.body).not.toHaveProperty('token')        // token is in cookie, not body

    // cookie must be set
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.startsWith('tt_token='))).toBe(true)
    expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true)

    createdUserId = res.body.user.id
  })

  it('rejects duplicate email with 409', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })
    expect(res.statusCode).toBe(409)
  })

  it('rejects invalid payload with 400 and errors object', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({ email: 'bademail', password: '123' })
    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('errors')
  })
})

// ─────────────────────────────────────────────────────────────
// Auth – Login
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('logs in, sets cookie, returns user without password or token', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.statusCode).toBe(200)
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user.email).toBe(TEST_EMAIL)
    expect(res.body.user).not.toHaveProperty('password')
    expect(res.body).not.toHaveProperty('token')
  })

  it('rejects wrong password with 401', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass!' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects unknown email with 401', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: TEST_PASSWORD })
    expect(res.statusCode).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────
// Auth – /me
// ─────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns user when cookie is present (via agent)', async () => {
    const res = await agent.get('/api/auth/me')
    expect(res.statusCode).toBe(200)
    expect(res.body.user.email).toBe(TEST_EMAIL)
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user).toHaveProperty('createdAt')
  })

  it('returns 401 with no cookie and no header', async () => {
    const res = await request(app).get('/api/auth/me') // plain request, no cookie
    expect(res.statusCode).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────
// Auth – Logout
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  it('clears the cookie', async () => {
    const res = await agent.post('/api/auth/logout')
    expect(res.statusCode).toBe(200)
    // After logout the cookie should be cleared (maxAge=0 / expires in the past)
    const cookies = res.headers['set-cookie'] || []
    const tokenCookie = cookies.find(c => c.startsWith('tt_token='))
    // cleared cookie either has empty value or expires=past
    if (tokenCookie) {
      expect(
        tokenCookie.includes('tt_token=;') ||
        tokenCookie.includes('Expires=Thu, 01 Jan 1970')
      ).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Apartments – public
// ─────────────────────────────────────────────────────────────
describe('GET /api/apartments', () => {
  it('returns apartments with aliased fields', async () => {
    const res = await request(app).get('/api/apartments')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.apartments)).toBe(true)
    const a = res.body.apartments[0]
    expect(a).toHaveProperty('slug')
    expect(a).toHaveProperty('avgRating')       // aliased
    expect(a).toHaveProperty('reviewCount')     // aliased
    expect(a).toHaveProperty('yearBuilt')       // aliased
    expect(a).not.toHaveProperty('avg_rating')  // old name gone
  })
})

describe('GET /api/apartments/:slug', () => {
  it('returns apartment detail with aliased review fields', async () => {
    const res = await request(app).get('/api/apartments/le-marchant-towers')
    expect(res.statusCode).toBe(200)
    expect(res.body.apartment.slug).toBe('le-marchant-towers')
    expect(res.body.apartment).toHaveProperty('avgRating')
    expect(Array.isArray(res.body.reviews)).toBe(true)
    if (res.body.reviews.length > 0) {
      const r = res.body.reviews[0]
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('text')          // aliased from body
      expect(r).toHaveProperty('author')
      expect(r).toHaveProperty('comments')
    }
  })

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/apartments/does-not-exist')
    expect(res.statusCode).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────
// Profile (re-login agent first)
// ─────────────────────────────────────────────────────────────
describe('Profile endpoints', () => {
  let profileAgent

  beforeAll(async () => {
    profileAgent = request.agent(app)
    await profileAgent
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
  })

  it('GET /api/profile returns stats with camelCase keys', async () => {
    const res = await profileAgent.get('/api/profile')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('stats')
    expect(res.body.stats).toHaveProperty('reviewCount')   // aliased
    expect(res.body.stats).toHaveProperty('commentCount')  // aliased
    expect(res.body.user).toHaveProperty('id')
  })

  it('PUT /api/profile updates name', async () => {
    const res = await profileAgent
      .put('/api/profile')
      .send({ name: 'Jest Updated' })
    expect(res.statusCode).toBe(200)
    expect(res.body.user.name).toBe('Jest Updated')
  })

  it('PUT /api/profile rejects wrong current password', async () => {
    const res = await profileAgent
      .put('/api/profile')
      .send({ newPassword: 'NewPass123', currentPassword: 'WrongOldPass' })
    expect(res.statusCode).toBe(401)
  })

  it('GET /api/profile returns 401 without auth', async () => {
    const res = await request(app).get('/api/profile')
    expect(res.statusCode).toBe(401)
  })
})