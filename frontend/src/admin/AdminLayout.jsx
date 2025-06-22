import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">Admin</h2>
        <nav className="space-y-1">
          <Link to="" className="block hover:underline">Dashboard</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
