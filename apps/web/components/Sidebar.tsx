export function Sidebar() {
  return (
    <aside style={{ width: '250px', backgroundColor: '#f0f0f0', padding: '20px', height: '100vh', position: 'fixed', left: 0, top: 0, borderRight: '1px solid #ddd' }}>
      <h2>Bento App</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}><a href="#">Dashboard</a></li>
          <li style={{ marginBottom: '10px' }}><a href="#">Settings</a></li>
        </ul>
      </nav>
    </aside>
  );
}
