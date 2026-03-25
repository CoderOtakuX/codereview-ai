import { Link, useNavigate, useLocation } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Don't render navbar on auth page or landing page (Landing Page handles its own nav)
  if (location.pathname === "/auth" || location.pathname === "/" || !token) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-background border-b border-zinc-800/50">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-white">
          CodeReview <span className="text-brand">AI</span>
        </Link>
        {/* Nav Links */}
        <div className="hidden md:flex items-center bg-editor rounded-full p-1 border border-zinc-800/50">
          <Link 
            to="/dashboard" 
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${location.pathname === '/dashboard' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
          >
            Dashboard
          </Link>

        </div>
      </div>
      {/* User Actions */}
      <button 
        onClick={handleLogout}
        className="px-6 py-2 bg-editor border border-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all"
      >
        Logout
      </button>
    </nav>
  );
}
