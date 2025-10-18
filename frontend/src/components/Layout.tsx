import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Outlet />
    </div>
  );
}

export default Layout;

