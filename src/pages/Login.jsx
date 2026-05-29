import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    
    // Authenticate and Navigate
    login(email, password)
    navigate('/dashboard')
  }

  const fillDemo = () => {
    setEmail('alex@dal.ca')
    setPassword('password123')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">TenantTrails</div>
        <p className="login-sub">See what past tenants had to say, before you sign.</p>

        {error && <div className="error-message" style={{backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="alex@dal.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn" style={{width: '100%'}}>
            Sign In
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <span className="login-link" onClick={() => navigate('/signup')}>Create one</span>
        </p>

        <div className="demo-badge" onClick={fillDemo}>
          Demo: <strong>alex@dal.ca / password123</strong>
        </div>
      </div>
    </div>
  )
}

export default Login