export default function StatsCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white shadow rounded p-4 flex items-center space-x-4">
      {Icon && <Icon className="w-8 h-8 text-blue-600" />}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-700">{value}</p>
      </div>
    </div>
  );
}
