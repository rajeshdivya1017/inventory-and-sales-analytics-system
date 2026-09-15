import { LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Inventory Sales</h1>

        {user && (
          <p className="text-sm text-gray-500">
            Welcome, {user.name}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
};

export default Navbar;