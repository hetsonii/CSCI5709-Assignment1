import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Signup.css'

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Create Account and Navigate
    signup(name, email, password)
    navigate('/dashboard')
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-logo">TenantTrails</h1>
        <p className="signup-sub">Create your account to submit reviews and comments.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{' '}
          <span className="signup-link" onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

export default Signup