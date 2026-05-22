import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
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

        <button className="login-btn" onClick={handleSubmit}>
          Sign In
        </button>

        <p className="login-footer">
          Don't have an account?{' '}
          <span className="login-link" onClick={() => navigate('/login')}>Create one</span>
        </p>

        <div className="demo-badge" onClick={fillDemo}>
          Demo: <strong>alex@dal.ca / password123</strong>
        </div>
      </div>
    </div>
  )
}

export default Login
