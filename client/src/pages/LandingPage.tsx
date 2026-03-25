import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 min-h-screen">
      {/* Top Navigation Bar - Note: This overrides the main Navbar for this page if it's identical, or replicates it */}
      <nav className="fixed top-0 w-full h-[64px] z-50 bg-[#f5f4f0]/60 dark:bg-[#131313]/60 backdrop-blur-xl border-b border-[#000000]/5 dark:border-[#ffffff]/10">
        <div className="flex justify-between items-center px-8 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-[#131313] dark:text-[#f5f4f0] font-headline">CodeReview AI</span>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-[#16a34a] dark:text-[#22C55E] font-bold border-b-2 border-[#16a34a] dark:border-[#22C55E] pb-1 font-headline text-sm tracking-tight" href="#">Features</a>
              <a className="text-[#1c1b1b]/60 dark:text-[#eeede9]/60 hover:text-[#131313] dark:hover:text-[#f5f4f0] transition-colors font-headline text-sm tracking-tight" href="#">How it Works</a>
              <a className="text-[#1c1b1b]/60 dark:text-[#eeede9]/60 hover:text-[#131313] dark:hover:text-[#f5f4f0] transition-colors font-headline text-sm tracking-tight" href="#">Docs</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#eeede9] dark:hover:bg-[#1c1b1b] rounded-full transition-all text-[#1c1b1b]/60 dark:text-[#eeede9]/60" onClick={() => document.documentElement.classList.toggle('dark')}>
              <span className="material-symbols-outlined">dark_mode</span>
            </button>
            <Link to="/auth?mode=login" className="text-[#1c1b1b]/60 dark:text-[#eeede9]/60 hover:text-[#131313] dark:hover:text-[#f5f4f0] font-headline text-sm font-medium px-4 py-2">Log In</Link>
            <Link to="/auth?mode=register" className="bg-primary text-on-primary font-headline text-sm font-bold px-6 py-2 rounded-full hover:scale-95 active:scale-90 duration-200">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-[120px] flex flex-col items-center overflow-hidden">
        {/* Floating Particle Background Simulation */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 select-none overflow-hidden">
          <div className="absolute top-20 left-[10%] text-primary/40 font-mono text-xs animate-pulse">{`{ }`}</div>
          <div className="absolute top-40 right-[15%] text-primary/30 font-mono text-sm">=&gt;</div>
          <div className="absolute bottom-40 left-[20%] text-primary/20 font-mono text-lg font-bold">[]</div>
          <div className="absolute top-60 left-[40%] text-primary/10 font-mono text-xl">&amp;&amp;</div>
          <div className="absolute bottom-20 right-[30%] text-primary/40 font-mono text-sm">async</div>
          <div className="absolute top-1/2 left-10 text-primary/20 font-mono text-xs">await</div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 mb-8 z-10">
          <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
          <span className="text-xs font-mono tracking-widest uppercase text-on-surface-variant">AI-Powered · Instant · 10+ Languages</span>
        </div>

        {/* Headline */}
        <h1 className="text-[60px] md:text-[96px] leading-[0.95] font-headline font-black tracking-[-0.03em] text-center mb-6 z-10">
          <span className="text-on-surface">Your code,</span><br />
          <span className="text-primary italic">reviewed</span> <span className="text-on-surface">in seconds.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-on-surface-variant text-center max-w-[520px] mb-10 z-10 leading-relaxed px-4">
          Eliminate technical debt and catch critical bugs before they reach production. The AI mentor for modern engineering teams.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 z-10">
          <Link to="/auth" className="px-8 py-4 bg-primary text-on-primary font-bold rounded-full text-lg hover:scale-95 active:scale-90 transition-transform text-center">
            Get Started for Free
          </Link>
          <button className="px-8 py-4 border border-outline-variant text-on-surface font-bold rounded-full text-lg hover:bg-surface-container-low transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined">play_circle</span>
            Watch a Demo
          </button>
        </div>

        {/* Terminal Mock */}
        <div className="w-full max-w-[680px] px-4 z-10 pb-20">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-t-xl terminal-glow">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/40"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/40"></div>
                <div className="w-3 h-3 rounded-full bg-primary/40"></div>
              </div>
              <span className="text-xs font-mono text-on-surface-variant/60">review.js — 428 bytes</span>
              <div className="w-10"></div>
            </div>
            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <div className="flex gap-4">
                <span className="text-on-surface-variant/30 select-none">1</span>
                <code className="text-primary/80">function <span className="text-on-surface">validateUser</span>(data) {'{'}</code>
              </div>
              <div className="flex gap-4 bg-error-container/10">
                <span className="text-on-surface-variant/30 select-none">2</span>
                <code>  if (data.id == <span className="text-error font-bold">undefined</span>) return false;</code>
              </div>
              <div className="flex gap-4">
                <span className="text-on-surface-variant/30 select-none">3</span>
                <code className="text-on-surface-variant/60">  // Missing strict equality check</code>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 text-primary font-bold mb-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  <span>AI INSIGHT</span>
                </div>
                <p className="text-on-surface-variant mb-3 italic">"Consider using strict equality (===) and checking for null."</p>
                <div className="flex gap-3">
                  <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase">[WARN]</span>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded uppercase">[INFO]</span>
                  <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold rounded uppercase">[OK]</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-on-surface-variant/40 text-xs uppercase tracking-widest">Health Score</span>
                  <span className="text-primary font-bold text-lg">7.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="w-full bg-surface-container-low border-y border-outline-variant/10 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          <div className="flex flex-col items-center md:border-r border-outline-variant/10">
            <span className="text-3xl font-mono font-black text-on-surface mb-1">10M+</span>
            <span className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase text-center">Lines of code reviewed</span>
          </div>
          <div className="flex flex-col items-center md:border-r border-outline-variant/10">
            <span className="text-3xl font-mono font-black text-on-surface mb-1">25K+</span>
            <span className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase text-center">Developers saved hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-mono font-black text-on-surface mb-1">99.9%</span>
            <span className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase text-center">Uptime guaranteed</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-4">Engineered for Excellence</h2>
          <p className="text-on-surface-variant max-w-xl">Deep analysis that understands context, not just syntax. Built by developers for high-performance teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">bolt</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Instant Analysis</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Get feedback on every commit in under 10 seconds. No more waiting for human review cycles.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">security</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Security Scanning</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Automatically detect SQL injections, XSS, and hardcoded secrets before they leak to production.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">AI Insights</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Context-aware suggestions that learn from your codebase's unique patterns and architecture.</p>
          </div>
          {/* Feature 4 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">sync_alt</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Automated Workflow</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Seamlessly integrates with GitHub Actions, GitLab CI, and Bitbucket Pipelines for zero friction.</p>
          </div>
          {/* Feature 5 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">groups</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Team Collaboration</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Share insights and maintain coding standards across your entire organization with ease.</p>
          </div>
          {/* Feature 6 */}
          <div className="bg-surface border border-outline-variant/10 p-7 rounded-DEFAULT hover:bg-surface-container-high transition-colors group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Customizable Rules</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Fine-tune the AI to match your team's specific style guides and business requirements.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative md:pr-12 md:border-r border-outline-variant/20">
              <span className="block text-6xl font-mono font-black text-primary/40 mb-6">01</span>
              <h3 className="text-xl font-bold text-on-surface mb-4">Connect your repository</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Quickly authorize our app via GitHub, GitLab, or Bitbucket. We only read the code you specify.</p>
            </div>
            {/* Step 2 */}
            <div className="relative md:pr-12 md:border-r border-outline-variant/20">
              <span className="block text-6xl font-mono font-black text-primary/40 mb-6">02</span>
              <h3 className="text-xl font-bold text-on-surface mb-4">AI analyzes your code</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Our LLMs process your PRs instantly, checking for logic, performance, and security flaws.</p>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <span className="block text-6xl font-mono font-black text-primary/40 mb-6">03</span>
              <h3 className="text-xl font-bold text-on-surface mb-4">Receive actionable feedback</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Comments are posted directly on your PR. Review, approve, and merge with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Ready to write better code?</h2>
            <p className="text-on-surface-variant">Join 25,000+ developers shipping cleaner features today.</p>
          </div>
          <div className="relative z-10">
            <Link to="/auth" className="px-10 py-5 bg-primary text-on-primary font-bold rounded-full text-lg shadow-lg shadow-primary/10 hover:scale-95 transition-transform inline-block">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-[#f5f4f0] dark:bg-[#131313] border-t border-[#000000]/5 dark:border-[#ffffff]/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-7xl mx-auto gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-black text-[#131313] dark:text-[#f5f4f0] font-headline">CodeReview AI</span>
            <p className="text-[#1c1b1b]/40 dark:text-[#eeede9]/40 text-[10px] mt-2 uppercase tracking-[0.2em]">The AI Mentor for Modern Engineering</p>
          </div>
          <div className="flex items-center gap-8">
            <a className="text-[#1c1b1b]/40 dark:text-[#eeede9]/40 hover:text-[#16a34a] dark:hover:text-[#22C55E] transition-colors font-headline text-xs uppercase tracking-widest" href="#">Privacy</a>
            <a className="text-[#1c1b1b]/40 dark:text-[#eeede9]/40 hover:text-[#16a34a] dark:hover:text-[#22C55E] transition-colors font-headline text-xs uppercase tracking-widest" href="#">Terms</a>
            <a className="text-[#1c1b1b]/40 dark:text-[#eeede9]/40 hover:text-[#16a34a] dark:hover:text-[#22C55E] transition-colors font-headline text-xs uppercase tracking-widest" href="#">Github</a>
          </div>
          <p className="text-[#1c1b1b]/40 dark:text-[#eeede9]/40 font-headline text-xs uppercase tracking-widest">
            © 2026 CodeReview AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
