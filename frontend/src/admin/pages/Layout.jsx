import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function Layout() {
  const { token } = useAdminAuth();
  if (!token) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-4 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
