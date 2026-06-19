/**
 * Auth route tests
 * Run with: npm test (inside /server)
 *
 * Uses a real MySQL pool — make sure the Docker container is running
 * and the DB is seeded before running tests.
 * Each test cleans up its own data.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const request = require('supertest')
const app     = require('../index')
const pool    = require('../config/db')

const TEST_EMAIL    = `jest_test_${Date.now()}@test.com`
const TEST_PASSWORD = 'TestPass123'
const TEST_NAME     = 'Jest User'

let createdUserId
let authToken

afterAll(async () => {
  // Clean up test user
  if (createdUserId) {
    await pool.query('DELETE FROM users WHERE user_id = ?', [createdUserId])
  }
  await pool.end()
})

// ── Test 1: Signup ────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user).toMatchObject({ name: TEST_NAME, email: TEST_EMAIL })
    expect(res.body.user).not.toHaveProperty('password')

    createdUserId = res.body.user.user_id
    authToken     = res.body.token
  })

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toMatch(/already exists/i)
  })

  it('rejects missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'nope@test.com' })   // no name or password

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('errors')
  })

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'A', email: 'short@test.com', password: '123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toHaveProperty('password')
  })
})

// ── Test 2: Login ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns a token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe(TEST_EMAIL)
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass999' })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/invalid/i)
  })

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: TEST_PASSWORD })

    expect(res.statusCode).toBe(401)
  })

  it('rejects empty body with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})

    expect(res.statusCode).toBe(400)
  })
})

// ── Test 3: Protected route /api/auth/me ─────────────────────
describe('GET /api/auth/me', () => {
  it('returns the user profile with a valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.user.email).toBe(TEST_EMAIL)
  })

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.real.token')

    expect(res.statusCode).toBe(401)
  })
})

// ── Test 4: Apartments dashboard ─────────────────────────────
describe('GET /api/apartments', () => {
  it('returns an array of apartments with rating and review count', async () => {
    const res = await request(app).get('/api/apartments')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.apartments)).toBe(true)
    expect(res.body.apartments.length).toBeGreaterThan(0)

    const apt = res.body.apartments[0]
    expect(apt).toHaveProperty('slug')
    expect(apt).toHaveProperty('avg_rating')
    expect(apt).toHaveProperty('review_count')
  })
})

// ── Test 5: Single apartment ──────────────────────────────────
describe('GET /api/apartments/:slug', () => {
  it('returns apartment detail with reviews and rating breakdown', async () => {
    const res = await request(app).get('/api/apartments/le-marchant-towers')

    expect(res.statusCode).toBe(200)
    expect(res.body.apartment.slug).toBe('le-marchant-towers')
    expect(Array.isArray(res.body.reviews)).toBe(true)
    expect(res.body.ratingBreakdown).toHaveProperty('5')
  })

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/apartments/does-not-exist')
    expect(res.statusCode).toBe(404)
  })
})