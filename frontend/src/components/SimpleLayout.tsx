import { Outlet } from 'react-router-dom';

function SimpleLayout() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Outlet />
    </div>
  );
}

export default SimpleLayout;

