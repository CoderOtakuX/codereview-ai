import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] font-body selection:bg-primary/30 min-h-screen overflow-x-hidden antialiased">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full h-[64px] z-50 bg-[#131313]/60 backdrop-blur-3xl border-b border-white/5">
        <div className="flex justify-between items-center px-8 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tighter text-white font-headline hover:opacity-80 transition-opacity">
              CodeReview AI
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-[#eeede9]/60 hover:text-[#4be277] transition-colors font-headline text-sm tracking-tight" href="#how-it-works">How It Works</a>
              <a className="text-[#eeede9]/60 hover:text-[#4be277] transition-colors font-headline text-sm tracking-tight" href="#features">Features</a>
              {/* Docs removed per user request */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Removed per user request */}
            <Link to="/auth?mode=login" className="text-[#eeede9]/60 hover:text-[#f5f4f0] font-headline text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity">Log In</Link>
            <Link to="/auth?mode=register" className="bg-[#4be277] text-[#003915] font-headline text-sm font-bold px-6 py-2 rounded-full hover:scale-95 active:scale-90 duration-200">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-[120px] flex flex-col items-center overflow-hidden">
        {/* Floating Particle Background Simulation */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-30 select-none overflow-hidden text-[#4be277]/20 font-mono">
          <div className="absolute top-20 left-[10%] text-xs animate-pulse opacity-40">{`{ }`}</div>
          <div className="absolute top-40 right-[15%] text-sm opacity-30">=&gt;</div>
          <div className="absolute bottom-40 left-[20%] text-lg font-bold opacity-20">[]</div>
          <div className="absolute top-60 left-[40%] text-xl opacity-10">&amp;&amp;</div>
          <div className="absolute bottom-20 right-[30%] text-sm opacity-40">async</div>
          <div className="absolute top-1/2 left-10 text-xs opacity-20">await</div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a2a2a] border border-[#3d4a3d]/20 mb-8 z-10">
          <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
          <span className="text-xs font-mono tracking-widest uppercase text-[#bccbb9]">AI-Powered · Instant · 10+ Languages</span>
        </div>

        {/* Headline */}
        <h1 className="text-[80px] md:text-[96px] leading-[0.95] font-headline font-black tracking-[-0.03em] text-center mb-6 z-10">
          <span className="text-[#e5e2e1]">Your code,</span><br />
          <span className="text-[#4be277] italic">reviewed</span> <span className="text-[#e5e2e1]">in seconds.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-[#bccbb9] text-center max-w-[520px] mb-10 z-10 leading-relaxed px-4 font-body">
          Eliminate technical debt and catch critical bugs before they reach production. The intelligent ledger for modern engineering teams.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 z-10">
          <Link to="/auth" className="px-8 py-4 bg-[#4be277] text-[#003915] font-headline font-bold rounded-full text-lg hover:scale-95 active:scale-90 transition-transform text-center shadow-lg shadow-[#4be277]/20">
            Get Started for Free
          </Link>
          <button className="px-8 py-4 border border-[#3d4a3d] text-[#e5e2e1] font-headline font-bold rounded-full text-lg hover:bg-[#1c1b1b] transition-colors inline-flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined">play_circle</span>
            Watch a Demo
          </button>
        </div>

        {/* Terminal Mock */}
        <div className="w-full max-w-[680px] px-4 z-10 pb-20">
          <div className="bg-[#0e0e0e] border border-[#3d4a3d]/30 rounded-t-xl shadow-[0_0_48px_6px_rgba(75,226,119,0.06)]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d4a3d]/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ffb4ab]/40"></div>
                <div className="w-3 h-3 rounded-full bg-[#96d59d]/40"></div>
                <div className="w-3 h-3 rounded-full bg-[#4be277]/40"></div>
              </div>
              <span className="text-xs font-headline font-medium text-[#bccbb9]/60">review.js — 428 bytes</span>
              <div className="w-10"></div>
            </div>
            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <div className="flex gap-4">
                <span className="text-[#bccbb9]/30 select-none font-headline text-xs">1</span>
                <code className="text-[#4be277]/80 font-mono">function <span className="text-[#e5e2e1]">validateUser</span>(data) {'{'}</code>
              </div>
              <div className="flex gap-4 bg-[#93000a]/10">
                <span className="text-[#bccbb9]/30 select-none font-headline text-xs">2</span>
                <code className="font-mono">  if (data.id == <span className="text-[#ffb4ab] font-bold">undefined</span>) return false;</code>
              </div>
              <div className="flex gap-4">
                <span className="text-[#bccbb9]/30 select-none font-headline text-xs">3</span>
                <code className="text-[#bccbb9]/60 font-mono">  // Missing strict equality check</code>
              </div>
              <div className="mt-4 pt-4 border-t border-[#3d4a3d]/10">
                <div className="flex items-center gap-2 text-[#4be277] font-headline font-bold mb-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  <span>AI INSIGHT</span>
                </div>
                <p className="text-[#bccbb9] mb-3 italic font-body">"Consider using strict equality (===) and checking for null."</p>
                <div className="flex gap-3">
                  <span className="px-2 py-0.5 bg-[#93000a] text-[#ffdad6] text-[10px] font-headline font-bold rounded uppercase">[WARN]</span>
                  <span className="px-2 py-0.5 bg-[#175428] text-[#89c78f] text-[10px] font-headline font-bold rounded uppercase">[INFO]</span>
                  <span className="px-2 py-0.5 bg-[#22c55e] text-[#004b1e] text-[10px] font-headline font-bold rounded uppercase">[OK]</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[#bccbb9]/40 text-xs font-headline uppercase tracking-widest">Health Score</span>
                  <span className="text-[#4be277] font-headline font-black text-lg">7.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="w-full bg-[#1c1b1b] border-y border-[#3d4a3d]/10 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          <div className="flex flex-col items-center md:border-r border-[#3d4a3d]/10">
            <span className="text-3xl font-headline font-black text-[#e5e2e1] mb-1">10M+</span>
            <span className="text-[10px] font-headline tracking-widest text-[#bccbb9] uppercase">Lines of code reviewed</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-[#3d4a3d]/10">
            <span className="text-3xl font-headline font-black text-[#e5e2e1] mb-1">25K+</span>
            <span className="text-[10px] font-headline tracking-widest text-[#bccbb9] uppercase">Developers saved hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-headline font-black text-[#e5e2e1] mb-1">99.9%</span>
            <span className="text-[10px] font-headline tracking-widest text-[#bccbb9] uppercase">Uptime guaranteed</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <header className="mb-24">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-surface-container-low border border-white/5 text-primary text-xs font-headline font-bold uppercase tracking-widest">
            The Process
          </div>
          <h2 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-white max-w-4xl mb-8 leading-[0.9]">
            How It Works
          </h2>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-body">
            Transforming your development workflow through the precision of editorial AI analysis. Simple integration, deep insights, actionable results.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 relative">
          {/* Step 1 */}
          <div className="group">
            <div className="mb-12 overflow-hidden rounded-xl bg-surface-container-low aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              <img 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSHWzoW5BqZqRiBlVbcLdU84SYMrXzCFE15hvpJDBtZL22LQT0eoaWH4o87D8IMvNDCnCHU5r693Vi5YC9FTAH-Ivww3xrTHjbjMWLQ-3EAtdFAIpwk6OJYVnjQmc2RMYQ8XNHaK1YUggSfnMOOC5LhT6PU7iV9hTwKrPwz9kfvpunsi946kRGktaI2x1L05fg3WKaGtu1sDUx5raTDBx4pPj8zwqUQpvR6cBtg1wG6v7l5MDhdfvGQNPp6DX5xGQIZyCJVdFgVncJ"
                alt="Connect Repository"
              />
              <div className="absolute bottom-6 left-6 font-mono text-6xl font-bold text-[#22c55e] opacity-80">01</div>
            </div>
            <h3 className="text-2xl font-headline font-bold text-white mb-4">Connect Your Repository</h3>
            <p className="text-on-surface-variant leading-relaxed mb-6 font-body">
              Link your GitHub or GitLab project with a single click. Our secure integration ensures your code stays private while we provide comprehensive visibility across your codebase.
            </p>
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded bg-surface-container-high text-xs font-headline font-bold text-zinc-400 uppercase">Github</span>
              <span className="px-3 py-1 rounded bg-surface-container-high text-xs font-headline font-bold text-zinc-400 uppercase">Gitlab</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group">
            <div className="mb-12 overflow-hidden rounded-xl bg-surface-container-low aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              <img 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1eEBXtl72gjGUIBSZszPdiEc98RzcKQOUkh8PGZKXccoYUwTzihSccpcXrrVtXGORJs05K3GZzTcjs0t2r6P4aGY8lvG0grh8k6UF_5l3EwG0QR2Q_D_79VUQV7oZHtvvdUT-ycg_ae132R7F_o7Au5Fz01lorj8mCAITjzjsCzriBlr7YAaI-Qab1fDBbEhRImr_ZO2lXqU9RxhxEaNU2La7hgYV3OTsOrvHJncLUXoZr_jNzBBuXH9lLFOeBM7YWDC-YkAkhfmt"
                alt="AI Analysis"
              />
              <div className="absolute bottom-6 left-6 font-mono text-6xl font-bold text-[#22c55e] opacity-80">02</div>
            </div>
            <h3 className="text-2xl font-headline font-bold text-white mb-4">AI Analyzes Your Code</h3>
            <p className="text-on-surface-variant leading-relaxed mb-6 font-body">
              The model runs its deep review process. Leveraging large language models fine-tuned for software engineering, we detect patterns, vulnerabilities, and optimization opportunities.
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-lg font-mono text-xs text-primary/70 border border-white/5">
              <span className="block opacity-50">$ scanning directories...</span>
              <span className="block opacity-80">&gt; analyzing logic branches</span>
              <span className="block">&gt; optimization found in main.py:142</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group">
            <div className="mb-12 overflow-hidden rounded-xl bg-surface-container-low aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              <img 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMNZkDB1-ImyHfnoO5lTRvs8E5jfD92KwNBC-jXjs90TT21k1PXhtArZHd59Ef4Ou0xZTpttDLC8R_01RxmgO5yQYJ9_x1KwydPd9g6qdDIiApS66VxXUzrxejrDMzVXLobqJ4XMxyuJ4bpwa_r9QadoDdp_V7-wrouSZeAIOTCQ_4ajI5GVeVEbV_ln1DJfZMj-iQA1jBOmBPwIv1qyC3fositC31FN85gOYylx5s210rppbD-Vnm4SiB1Nhd-_1MtvnvOWFqUoMn"
                alt="Actionable Feedback"
              />
              <div className="absolute bottom-6 left-6 font-mono text-6xl font-bold text-[#22c55e] opacity-80">03</div>
            </div>
            <h3 className="text-2xl font-headline font-bold text-white mb-4">Receive Actionable Feedback</h3>
            <p className="text-on-surface-variant leading-relaxed mb-6 font-body">
              Implement improvements with confidence. Get prioritized issues, suggested code diffs, and architectural advice delivered directly to your PR or dashboard.
            </p>
            <button className="group/btn flex items-center gap-2 text-primary text-sm font-headline font-semibold">
              Explore Sample Report 
              <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-8 border-t border-white/5">
        <div className="mb-16">
          <h2 className="text-4xl font-headline font-bold text-[#e5e2e1] mb-4">Engineered for Excellence</h2>
          <p className="text-[#bccbb9] max-w-xl font-body">Deep analysis that understands context, not just syntax. Built by developers for high-performance teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#131313] border border-[#3d4a3d]/10 p-7 rounded-lg hover:bg-[#2a2a2a] transition-colors group">
            <div className="w-12 h-12 bg-[#4be277]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4be277]/20 transition-colors">
              <span className="material-symbols-outlined text-[#4be277]">bolt</span>
            </div>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-3 font-headline">Instant Analysis</h3>
            <p className="text-[#bccbb9] text-sm leading-relaxed font-body">Get feedback on every commit in under 10 seconds. No more waiting for human review cycles.</p>
          </div>
          <div className="bg-[#131313] border border-[#3d4a3d]/10 p-7 rounded-lg hover:bg-[#2a2a2a] transition-colors group">
            <div className="w-12 h-12 bg-[#4be277]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4be277]/20 transition-colors">
              <span className="material-symbols-outlined text-[#4be277]">security</span>
            </div>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-3 font-headline">Security Scanning</h3>
            <p className="text-[#bccbb9] text-sm leading-relaxed font-body">Automatically detect SQL injections, XSS, and hardcoded secrets before they leak to production.</p>
          </div>
          <div className="bg-[#131313] border border-[#3d4a3d]/10 p-7 rounded-lg hover:bg-[#2a2a2a] transition-colors group">
            <div className="w-12 h-12 bg-[#4be277]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4be277]/20 transition-colors">
              <span className="material-symbols-outlined text-[#4be277]">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-3 font-headline">AI Insights</h3>
            <p className="text-[#bccbb9] text-sm leading-relaxed font-body">Context-aware suggestions that learn from your codebase's unique patterns and architecture.</p>
          </div>
        </div>
      </section>

      {/* Asymmetric CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-surface-container-low rounded-xl overflow-hidden border border-white/5">
          <div className="p-12 md:p-24 flex flex-col justify-center">
            <h2 className="text-4xl font-headline font-bold text-white mb-6">Ready to ship better code?</h2>
            <p className="text-on-surface-variant mb-10 text-lg font-body">Join over 10,000 developers using CodeReview AI to automate their quality assurance process.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold transition-all hover:shadow-[0_0_20px_rgba(75,226,119,0.3)] active:scale-95 text-center">
                Start Your Free Trial
              </Link>
              <button className="bg-transparent border border-outline-variant/30 text-on-surface px-8 py-4 rounded-full font-headline font-bold hover:bg-white/5 transition-all outline-none">
                Talk to Sales
              </button>
            </div>
          </div>
          <div className="h-64 md:h-auto relative">
            <img 
              className="absolute inset-0 w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa4kTIc_52LKktFu8JK6VZGNi0zE1tRRxayJPcH-yDUHpFEVgWo73C4xBlcQJF3ubpylfXufMBSP-oLquFnUJye1rwgqgU1LCEorDvLrhd0U9cgKnLlnLbmXlJjLSjrziD7Hx2Uly74jrZAUgxnyljrVxC3i22_tvxheTD8yf1PLtDLKCSo1Y61xXYD1us6NBmWf1cOcBbSKUQujF_eRVt2pqiWEnODcGe3ycWTVfjUU79_yZycnyZN4PWqsMOs4z6Msgiq6BwRDp7"
              alt="Server Room"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-transparent to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-white/5 bg-[#131313]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="font-headline text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            © 2026 CodeReview AI. Built for precision.
          </div>
          <div className="flex gap-8">
            <a className="font-headline text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-[#4be277] transition-colors hover:underline decoration-2 underline-offset-4" href="#">Privacy</a>
            <a className="font-headline text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-[#4be277] transition-colors hover:underline decoration-2 underline-offset-4" href="#">Terms</a>
            <a 
              className="font-headline text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-[#4be277] transition-colors hover:underline decoration-2 underline-offset-4" 
              href="https://github.com/CoderOtakuX/codereview-ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
