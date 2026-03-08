// app/page.tsx
export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>A11y Formation API</h1>
      <p>API endpoints available at /api/*</p>
      <ul>
        <li>GET /api/users - Get all users</li>
        <li>POST /api/users - Create a new user</li>
      </ul>
    </main>
  )
}
