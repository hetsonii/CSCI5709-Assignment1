const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || 'root1234',
  database:           process.env.DB_NAME     || 'tenanttrails',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
})

// Verify connectivity on startup
pool.getConnection()
  .then(conn => {
    console.log('✔  MySQL pool connected')
    conn.release()
  })
  .catch(err => {
    console.error('✖  MySQL connection failed:', err.message)
    process.exit(1)
  })

module.exports = pool