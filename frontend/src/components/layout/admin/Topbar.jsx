const Topbar = () => {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <span className="text-sm text-gray-600">
        Bác sĩ của mọi nhà, Sức khỏe của mọi người.
      </span>

      <div className="flex items-center gap-3">
        <input
          placeholder="Tìm bệnh nhân..."
          className="ml-6 px-3 py-1.5 border rounded-md text-sm w-64"
        />
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm">
          Nhắn
        </button>
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
};

export default Topbar;
