import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = isLogin ? await api.login({ email, password }) : await api.register({ email, password });
      if (res.success && res.responseObject?.token) {
        localStorage.setItem("token", res.responseObject.token);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const guestEmail = `guest_${Math.random().toString(36).substring(7)}@codereview.ai`;
      const res = await api.register({ email: guestEmail, password: "GuestPassword123!" });
      if (res.success && res.responseObject?.token) {
        localStorage.setItem("token", res.responseObject.token);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError("Failed to create guest session. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body text-on-surface antialiased min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0f0f0f" }}>
      {/* Login Container */}
      <main className="w-full max-w-[480px]">
        {/* Login Card */}
        <div className="login-card p-12 rounded-[24px] shadow-2xl relative overflow-hidden">
          {/* Branding Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center mb-4 border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="terminal">terminal</span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-white mb-2">CodeReview AI</h1>
            <p className="text-on-surface-variant font-medium text-sm tracking-tight opacity-70">Smarter code. Faster reviews.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-error-container/10 border border-error-container/30 rounded-lg text-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input
                  className="input-dark w-full px-5 py-4 rounded-[16px] border-none text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary-container transition-all duration-200 outline-none"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                {isLogin && (
                  <a className="text-xs font-medium text-primary hover:text-primary-fixed-dim transition-colors" href="#">Forgot?</a>
                )}
              </div>
              <div className="relative group">
                <input
                  className="input-dark w-full px-5 py-4 rounded-[16px] border-none text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary-container transition-all duration-200 outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  minLength={isLogin ? 1 : 8}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {/* Action Button */}
            <div className="pt-2">
              <button
                className="w-full bg-primary-container hover:bg-primary text-on-primary-fixed font-bold py-4 rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg shadow-primary-container/10 flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Register")}
                <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Guest Action */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full border border-outline-variant/30 hover:bg-surface-container-high text-on-surface font-semibold py-4 rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Use without Signup
              <span className="material-symbols-outlined text-lg" data-icon="explore">explore</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-primary font-semibold hover:underline underline-offset-4 ml-1"
              >
                {isLogin ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
          {/* Subtle Backdrop Ornament */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-container/5 blur-[80px] rounded-full pointer-events-none"></div>
        </div>
        {/* Footer Meta */}
        <div className="mt-8 flex flex-col items-center gap-4 px-4">
          <div className="flex items-center gap-6">
            <a className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40 hover:text-on-surface-variant transition-colors" href="#">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
            <a className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40 hover:text-on-surface-variant transition-colors" href="#">Terms of Service</a>
          </div>
          {/* Code Bridge Ornament */}
          <div className="font-mono text-[11px] text-on-surface-variant/20 select-none">
            &lt;status: awaiting_authentication /&gt;
          </div>
        </div>
      </main>
      {/* Visual Background Element (Editorial Layout) */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAwc0p-fwuzdUIGgPj3S4y_N4nb_Dw62CFdyDN4JdmKhfr2F2E0nYNYQknJMGiasLu1wNOHrxuu4ThzuazGgcZ02jcG_iX7bGtSSMaJkfA69hpUP6EGo3vkiO1wtI1zJcPaH37zoQfn4jW8cvfIVpTxgqAP9nfzBB2lqb3HJvowwW6Xg9SLHqHJGo9YotUOb0Ovkn8V5RN7Id-uxaCWZX6ESiTSMGpZVhANK8NczUtOWB0FL9tR75i3edD-jfbXHo_Z8QyhQOrq6f2k')" }}></div>
      </div>
    </div>
  );
}
