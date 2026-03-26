import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { AlertCircle, CheckCircle, Clock, UploadCloud, Code2, GitPullRequest, ChevronDown, ChevronRight, FolderGit, MessageCircle, ExternalLink, Send, Download, Copy } from "lucide-react";
import toast from "react-hot-toast";

function PrReviewPanel({ file }: { file: { filename: string, reviewId: string } }) {
  const { data: reviewInfo } = useQuery({
    queryKey: ['review', file.reviewId],
    queryFn: () => api.getReview(file.reviewId),
    refetchInterval: (query) => {
      const status = query.state?.data?.responseObject?.status;
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });

  const status = reviewInfo?.responseObject?.status || "pending";
  const result = reviewInfo?.responseObject?.result;
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingPatch, setDownloadingPatch] = useState<number | null>(null);

  const handleDownloadFix = async (reviewId: string, issueIndex: number) => {
    try {
      setDownloadingPatch(issueIndex);
      await api.downloadIssuePatch(reviewId, issueIndex);
      toast.success('Patch downloaded! Apply with: git apply fix-line-*.patch');
    } catch (error) {
      toast.error('Failed to download patch');
    } finally {
      setDownloadingPatch(null);
    }
  };

  const handleDownloadAllFixes = async (reviewId: string, filename: string) => {
    try {
      await api.downloadAllPatches(reviewId, filename);
      toast.success('All fixes downloaded!');
    } catch (error) {
      toast.error('Failed to download patches');
    }
  };

  const handleCopyFix = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('✅ Fixed code copied to clipboard!');
  };

  return (
    <div className="border border-zinc-800 rounded-xl mb-4 bg-panel overflow-hidden shadow-lg">
      <div 
        className="flex justify-between items-center p-4 sm:p-5 cursor-pointer hover:bg-zinc-800/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-5 h-5 text-zinc-500" /> : <ChevronRight className="w-5 h-5 text-zinc-500" />}
          <span className="font-mono text-sm text-white truncate max-w-[180px] sm:max-w-xs">{file.filename}</span>
        </div>
        <div className="flex items-center gap-3">
          {status === "pending" || status === "processing" ? (
             <Clock className="w-4 h-4 text-brand animate-pulse" />
          ) : status === "completed" ? (
             <CheckCircle className="w-4 h-4 text-brand" />
          ) : (
             <AlertCircle className="w-4 h-4 text-red-500" title={reviewInfo?.responseObject?.errorMessage || ""} />
          )}
          <span className="text-xs uppercase px-2 py-1 rounded bg-editor border border-zinc-800 text-zinc-400 font-mono" title={reviewInfo?.responseObject?.errorMessage || ""}>
            {status}
          </span>
          {result?.score !== undefined && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand font-mono">{result.score}/10</span>
          )}
        </div>
      </div>
      {isOpen && status === "completed" && result && (
        <div className="p-5 border-t border-zinc-800 bg-background/50">
          <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{result.summary}</p>
          {result.issues && result.issues.length > 0 ? (
            <>
              {result.issues.map((issue: any, idx: number) => {
                let borderColor = "bg-blue-500";
                let textColor = "text-blue-400";
                if (issue.severity === "high") { borderColor = "bg-red-500"; textColor = "text-red-400"; }
                else if (issue.severity === "medium") { borderColor = "bg-orange-500"; textColor = "text-orange-400"; }
                
                const hasFix = issue.affectedCode && issue.fixedCode;

                return (
                  <div key={idx} className="mb-4 bg-editor border border-zinc-800 rounded-xl overflow-hidden flex relative">
                    <div className={`w-1 shrink-0 ${borderColor}`}></div>
                    <div className="p-4 w-full overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-xs font-bold uppercase ${textColor}`}>{issue.severity} • {issue.type}</span>
                         {issue.line && <span className="text-xs font-mono bg-background px-2 py-1 rounded text-zinc-500">L{issue.line}</span>}
                      </div>
                      <p className="text-sm mt-1 text-zinc-300 leading-relaxed break-words">{issue.message}</p>
                      
                      {hasFix ? (
                        <div className="mt-4 bg-zinc-900 border border-zinc-800/70 rounded-lg overflow-hidden font-mono text-xs shadow-inner">
                           <div className="px-3 py-2 bg-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800">
                             <div className="flex gap-2 w-full sm:w-auto">
                               <button
                                 onClick={() => handleCopyFix(issue.fixedCode)}
                                 className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-brand hover:bg-green-400 text-black font-extrabold rounded-md transition-colors"
                               >
                                 <Copy className="w-3 h-3" />
                                 Copy Fixed Code
                               </button>
                               <button
                                 onClick={() => handleDownloadFix(file.reviewId, idx)}
                                 disabled={downloadingPatch === idx}
                                 className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-bold rounded-md transition-colors disabled:opacity-50 text-[10px] uppercase tracking-wider"
                                 title="Download as Git patch file (advanced)"
                               >
                                 <Download className={`w-3 h-3 ${downloadingPatch === idx ? 'animate-bounce' : ''}`} />
                                 {downloadingPatch === idx ? "..." : ".patch"}
                               </button>
                             </div>
                           </div>
                           <div className="p-3 overflow-x-auto whitespace-pre">
                             <div className="text-red-400/90 block">- {issue.affectedCode.replace(/\n/g, '\n- ')}</div>
                             <div className="text-brand/90 block mt-1">+ {issue.fixedCode.replace(/\n/g, '\n+ ')}</div>
                           </div>
                        </div>
                      ) : (
                        <p className="text-xs mt-3 text-brand font-mono bg-background border border-zinc-800 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {result.issues.some((i: any) => i.affectedCode && i.fixedCode) && (
                <button
                  onClick={() => handleDownloadAllFixes(file.reviewId, file.filename)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> Download All Fixes for {file.filename}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-brand">
              <CheckCircle className="w-4 h-4" />
              <p className="text-sm font-medium">No issues detected in {file.filename}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("typescript");
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "github" | "repo">("paste");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prUrl, setPrUrl] = useState("");
  const [prReviews, setPrReviews] = useState<{ filename: string; reviewId: string; status: string }[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [repoReviews, setRepoReviews] = useState<{ filename: string; reviewId: string; status: string }[]>([]);
  const [availableFiles, setAvailableFiles] = useState<Array<{ path: string; url: string; size: number }>>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [downloadingPatch, setDownloadingPatch] = useState<number | null>(null);

  const handleDownloadFix = async (reviewId: string, issueIndex: number) => {
    try {
      setDownloadingPatch(issueIndex);
      await api.downloadIssuePatch(reviewId, issueIndex);
      toast.success('Patch downloaded! Apply with: git apply fix-line-*.patch');
    } catch (error) {
      toast.error('Failed to download patch');
    } finally {
      setDownloadingPatch(null);
    }
  };

  const handleDownloadAllFixes = async (reviewId: string, filename: string) => {
    try {
      await api.downloadAllPatches(reviewId, filename);
      toast.success('All fixes downloaded!');
    } catch (error) {
      toast.error('Failed to download patches');
    }
  };

  const handleCopyFix = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('✅ Fixed code copied to clipboard!');
  };

  const { data: reviewInfo, error } = useQuery({
    queryKey: ['review', currentReviewId],
    queryFn: () => api.getReview(currentReviewId!),
    enabled: !!currentReviewId,
    refetchInterval: (query) => {
      const status = query.state?.data?.responseObject?.status;
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });



  const handleReview = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.submitReview(code, language);
      if (res.success && res.responseObject?.id) {
        setCurrentReviewId(res.responseObject.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadSubmit = async () => {
    if (!selectedFile) return;
    try {
      setIsSubmitting(true);
      const res = await api.uploadFile(selectedFile);
      if (res.success && res.responseObject?.id) {
        setCurrentReviewId(res.responseObject.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubSubmit = async () => {
    if (!prUrl) return;
    try {
      setIsSubmitting(true);
      const res = await api.submitGithubPR(prUrl);
      if (res.success && res.responseObject) {
        setPrReviews(res.responseObject);
      } else if (!res.success && res.message) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error importing PR: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchFiles = async () => {
    if (!repoUrl) return;
    try {
      setIsSubmitting(true);
      setShowFilePicker(false);
      setAvailableFiles([]);
      setSelectedPaths([]);
      setRepoReviews([]);
      const res = await api.submitGithubRepo(repoUrl);
      if (res.success && res.responseObject) {
        setAvailableFiles(res.responseObject);
        setSelectedPaths(res.responseObject.map((f: any) => f.path));
        setShowFilePicker(true);
      } else if (!res.success && res.message) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error fetching files: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFile = (path: string) => {
    setSelectedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleReviewSelected = async () => {
    const filesToReview = availableFiles.filter(f => selectedPaths.includes(f.path));
    if (filesToReview.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await api.submitSelectedFiles(filesToReview);
      if (res.success && res.responseObject) {
        setRepoReviews(res.responseObject);
        setShowFilePicker(false);
      } else if (!res.success && res.message) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error reviewing files: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewResult = reviewInfo?.responseObject?.result;
  const status = reviewInfo?.responseObject?.status;

  const handleChatSend = async () => {
    if (!chatInput.trim() || !currentReviewId || isChatting) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);
    try {
      const res = await api.chatWithReview(currentReviewId, userMsg);
      if (res.success && res.responseObject?.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: res.responseObject.reply }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-12 py-8 flex flex-col lg:flex-row gap-12 text-white antialiased">
      {/* BEGIN: Left Panel (Editor Side) */}
      <section className="flex-1 lg:w-[55%] flex flex-col" data-purpose="editor-panel">


        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter mb-8 text-white">Review Your Code</h1>
        
        {/* Mode Selectors */}
        <div className="flex flex-wrap gap-3 mb-4" data-purpose="mode-selector">
          {['paste', 'upload', 'github', 'repo'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab as any); setCurrentReviewId(null); }} 
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all capitalize shadow-sm ${activeTab === tab ? 'bg-white text-black' : 'bg-surface border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              {tab.replace('github', 'GitHub PR').replace('repo', 'GitHub Repo')}
            </button>
          ))}
        </div>

        {/* Language Selectors for Paste Mode */}
        {activeTab === "paste" && (
          <div className="flex flex-wrap gap-2 mb-8" data-purpose="language-selector">
            {['typescript', 'javascript', 'python', 'go', 'java', 'cpp'].map(lang => (
              <button 
                key={lang} 
                onClick={() => setLanguage(lang)} 
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all capitalize shadow-sm ${language === lang ? 'bg-brand text-black' : 'bg-transparent text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* Code Editor Window */}
        <div className="bg-editor border border-zinc-800 rounded-2xl p-4 sm:p-8 mb-8 font-mono text-lg min-h-[400px] sm:min-h-[480px] relative overflow-hidden flex flex-col shadow-2xl" data-purpose="code-editor">
          {activeTab === "paste" ? (
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: 'JetBrains Mono' }}
            />
          ) : activeTab === "upload" ? (
            <div 
              className="absolute inset-0 m-6 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl flex flex-col items-center justify-center bg-surface/30 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".js,.ts,.py,.go,.java,.cpp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="w-16 h-16 text-zinc-600 mb-6" />
              {selectedFile ? (
                <>
                  <p className="text-white font-bold text-xl">{selectedFile.name}</p>
                  <p className="text-brand font-mono text-sm mt-3 bg-brand/10 px-3 py-1 rounded">Ready to upload • {(selectedFile.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <p className="text-white font-bold text-xl mb-2">Drop a file here or click to browse</p>
                  <p className="text-zinc-500 text-sm">Accepts: .js, .ts, .py, .go, .java, .cpp</p>
                </>
              )}
            </div>
          ) : activeTab === "repo" ? (
            <div className="absolute inset-0 m-4 flex flex-col overflow-hidden">
              {!showFilePicker && repoReviews.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <FolderGit className="w-16 h-16 text-zinc-600 mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-3">Review Repository</h2>
                  <p className="text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
                    Paste a GitHub repo URL (e.g., https://github.com/owner/repo) to browse and select files for deep AI analysis.
                  </p>
                  <div className="w-full max-w-lg flex relative shadow-2xl rounded-md overflow-hidden">
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="flex-1 bg-surface border border-zinc-800 border-r-0 px-5 py-4 text-sm text-white focus:outline-none focus:bg-zinc-900 transition-colors"
                    />
                    <button
                      onClick={handleFetchFiles}
                      disabled={isSubmitting || !repoUrl}
                      className="bg-brand hover:bg-green-400 disabled:opacity-50 text-black font-extrabold px-8 py-4 text-sm transition-colors whitespace-nowrap"
                    >
                      {isSubmitting ? "Scanning..." : "Fetch Files"}
                    </button>
                  </div>
                </div>
              )}

              {showFilePicker && (
                <div className="flex flex-col h-full bg-surface border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-panel">
                    <p className="text-sm text-zinc-400">
                      <span className="text-white font-bold">{selectedPaths.length}</span> of {availableFiles.length} files selected
                    </p>
                    <button
                      onClick={() => setSelectedPaths(selectedPaths.length === availableFiles.length ? [] : availableFiles.map(f => f.path))}
                      className="text-xs font-bold uppercase tracking-wider text-brand hover:text-green-400 transition-colors"
                    >
                      {selectedPaths.length === availableFiles.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {availableFiles.map(file => (
                      <label
                        key={file.path}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/50 cursor-pointer border-b border-zinc-800/50 last:border-b-0 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPaths.includes(file.path)}
                          onChange={() => toggleFile(file.path)}
                          className="w-5 h-5 accent-brand rounded border-zinc-700 bg-editor cursor-pointer"
                        />
                        <span className="font-mono text-sm text-zinc-300 truncate flex-1">{file.path}</span>
                        <span className="text-xs font-mono text-zinc-600 bg-editor px-2 py-1 rounded border border-zinc-800">{(file.size / 1024).toFixed(1)} KB</span>
                      </label>
                    ))}
                  </div>
                  {selectedPaths.length > 0 && (
                    <div className="p-4 bg-panel border-t border-zinc-800">
                      <button
                        onClick={handleReviewSelected}
                        disabled={isSubmitting}
                        className="w-full bg-brand hover:bg-green-400 disabled:opacity-50 text-black font-extrabold py-4 rounded-lg text-lg transition-transform active:scale-[0.99] shadow-lg shadow-brand/20"
                      >
                        {isSubmitting ? "Submitting batch..." : `Review ${selectedPaths.length} Selected Files`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 m-6 flex flex-col items-center justify-center text-center p-8">
              <GitPullRequest className="w-16 h-16 text-zinc-600 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">Import Pull Request</h2>
              <p className="text-zinc-400 text-sm max-w-md mb-8 leading-relaxed">
                Paste a pull request URL to automatically review all changed files. Instantly find bugs and security vulnerabilities.
              </p>
              <div className="w-full max-w-lg flex relative shadow-2xl rounded-md overflow-hidden">
                <input
                  type="url"
                  value={prUrl}
                  onChange={e => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/42"
                  className="flex-1 bg-surface border border-zinc-800 border-r-0 px-5 py-4 text-sm text-white focus:outline-none focus:bg-zinc-900 transition-colors"
                />
                <button
                  onClick={handleGithubSubmit}
                  disabled={isSubmitting || !prUrl}
                  className="bg-brand hover:bg-green-400 disabled:opacity-50 text-black font-extrabold px-8 py-4 text-sm transition-colors whitespace-nowrap"
                >
                  {isSubmitting ? "Importing..." : "Import PR"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {(activeTab !== "github" && activeTab !== "repo") && (
          <button
            onClick={activeTab === "paste" ? handleReview : handleFileUploadSubmit}
            disabled={isSubmitting || status === "pending" || status === "processing" || (activeTab === "upload" && !selectedFile)}
            className="w-full py-5 bg-brand hover:bg-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:hover:shadow-none text-black font-extrabold text-xl rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            data-purpose="run-review-btn"
          >
            {isSubmitting || status === "pending" || status === "processing" ? "Analyzing in the cloud..." : "Run Review"}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        )}
      </section>

      {/* BEGIN: Right Panel (Score & Analysis) */}
      <aside className="flex-1 lg:w-[45%] bg-surface border border-zinc-800 rounded-[2.5rem] p-6 sm:p-12 overflow-hidden flex flex-col max-h-[1400px] shadow-2xl" data-purpose="analysis-panel">
        {/* Render Github/Repo File List OR Single File Result */}
        {activeTab === "github" || activeTab === "repo" ? (
          (activeTab === "github" ? prReviews : repoReviews).length > 0 ? (
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{activeTab === "github" ? "PR Results" : "Repository Results"}</h3>
                <span className="text-xs bg-zinc-800 px-4 py-1.5 rounded-full text-zinc-300 font-bold">{(activeTab === "github" ? prReviews : repoReviews).length} Files Analyzed</span>
              </div>
              {(activeTab === "github" ? prReviews : repoReviews).map(review => (
                <PrReviewPanel key={review.reviewId} file={review} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
              {activeTab === "github" ? <GitPullRequest className="w-20 h-20 mb-6 opacity-20" /> : <FolderGit className="w-20 h-20 mb-6 opacity-20" />}
              <p className="text-zinc-500 font-medium text-lg">{activeTab === "github" ? "Import a PR to see batch review results" : "Review a repo to see batch results"}</p>
            </div>
          )
        ) : (
          <>
            {error && (
              <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 mb-4" />
                <span className="font-bold">{error instanceof Error ? error.message : String(error)}</span>
              </div>
            )}
            
            {!status && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                <Code2 className="w-24 h-24 mb-8 opacity-20" />
                <p className="text-zinc-500 font-medium text-xl">Submit your code to see the review results</p>
                <p className="text-zinc-600 text-sm mt-3 max-w-xs text-center">Our AI models will analyze your code for logic flaws, security vulnerabilities, and performance constraints.</p>
              </div>
            )}

            {(status === "pending" || status === "processing") && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative">
                  <Clock className="w-20 h-20 mb-8 text-brand relative z-10" />
                  <div className="absolute inset-0 bg-brand/30 blur-3xl rounded-full animate-pulse"></div>
                </div>
                <p className="font-extrabold text-3xl tracking-tight text-white mb-3">AI is analyzing...</p>
                <p className="text-zinc-400 text-center max-w-sm leading-relaxed">We're applying dynamic linting, extracting structural complexity, and matching architectural patterns.</p>
              </div>
            )}

            {status === "failed" && (
              <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-8 text-center">
                <AlertCircle className="w-20 h-20 mb-6 opacity-80" />
                <p className="font-extrabold text-2xl tracking-tight">Analysis Failed</p>
                {reviewInfo?.responseObject?.errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-6 max-w-lg w-full">
                    <p className="text-xs uppercase tracking-widest font-bold mb-2 opacity-50">Error Reason</p>
                    <p className="text-sm font-mono break-words">
                      {reviewInfo.responseObject.errorMessage}
                    </p>
                  </div>
                )}
                <p className="text-red-400/50 mt-6 text-sm italic">You may need to wait a minute and try again if this is a rate limit error.</p>
              </div>
            )}

            {status === "completed" && reviewResult && (
              <div className="flex flex-col h-full">
                {/* Score Display */}
                <div className="text-center mb-10 shrink-0">
                  <h2 className="score-text text-[6rem] sm:text-[8rem] leading-none font-extrabold tracking-[-0.05em] text-white">
                    {reviewResult.score}<span className="text-[4rem] text-zinc-600">/10</span>
                  </h2>
                  <p className="text-zinc-300 text-lg sm:text-xl max-w-md mx-auto leading-relaxed mt-6">
                    {reviewResult.summary}
                  </p>
                </div>

                {/* Issues List */}
                <div className="space-y-6 overflow-y-auto pr-2 flex-1 pb-6 sidebar-scroll" data-purpose="issues-list">
                  {reviewResult.issues?.map((issue: any, idx: number) => {
                    let borderColor = "bg-blue-500";
                    if (issue.severity === "high") {
                      borderColor = "bg-red-500";
                    } else if (issue.severity === "medium") {
                      borderColor = "bg-orange-500";
                    }

                    const hasFix = issue.affectedCode && issue.fixedCode;

                    return (
                      <div key={idx} className="bg-panel border border-zinc-800 rounded-2xl overflow-hidden flex relative shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <div className={`w-2 shrink-0 ${borderColor}`}></div>
                        <div className="p-6 sm:p-8 w-full max-w-full overflow-hidden">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-white capitalize break-words">
                              {issue.severity} Issue<span className="text-zinc-500 mx-2">:</span><span className="font-normal text-zinc-300">{issue.type}</span>
                            </h3>
                            {issue.line && (
                              <span className="text-xs font-mono font-bold text-zinc-400 bg-editor px-3 py-1.5 rounded-full border border-zinc-800 ml-3 shrink-0">Line {issue.line}</span>
                            )}
                          </div>
                          
                          {issue.pattern && (
                            <div className="mb-4">
                              <span className="text-xs font-bold uppercase tracking-widest bg-editor text-brand px-3 py-1.5 rounded-full border border-zinc-800">
                                <span className="mr-2">🔷</span>{issue.pattern}
                              </span>
                            </div>
                          )}

                          <p className="text-zinc-400 text-[15px] leading-relaxed mb-6 break-words">{issue.message}</p>
                          
                          <div className="bg-editor rounded-xl p-5 border border-zinc-800/50">
                            {hasFix ? (
                              <div className="mb-5 bg-[#0a0a0a] border border-zinc-800/70 rounded-xl overflow-hidden font-mono text-sm shadow-inner">
                                <div className="px-4 py-3 bg-zinc-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/70">
                                   <div className="flex gap-3 w-full sm:w-auto">
                                     <button
                                       onClick={() => handleCopyFix(issue.fixedCode)}
                                       className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-green-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-brand/10 active:scale-[0.98]"
                                     >
                                       <Copy className="w-4 h-4" />
                                       Copy Fixed Code
                                     </button>
                                     <button
                                       onClick={() => handleDownloadFix(currentReviewId!, idx)}
                                       disabled={downloadingPatch === idx}
                                       className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-xl transition-colors border border-zinc-700 flex items-center gap-2 text-xs uppercase tracking-widest"
                                       title="Download as Git patch file (advanced)"
                                     >
                                       <Download className={`w-3.5 h-3.5 ${downloadingPatch === idx ? 'animate-bounce' : ''}`} />
                                       {downloadingPatch === idx ? "..." : ".patch"}
                                     </button>
                                   </div>
                                 </div>
                                <div className="p-4 overflow-x-auto whitespace-pre">
                                  <div className="text-red-400/90 block">- {issue.affectedCode.replace(/\n/g, '\n- ')}</div>
                                  <div className="text-brand/90 block mt-1">+ {issue.fixedCode.replace(/\n/g, '\n+ ')}</div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-zinc-300 text-[15px] leading-relaxed break-words mb-5">
                                <span className="font-bold text-white uppercase tracking-wider text-xs mr-3 bg-zinc-800 px-2 py-1 rounded">Fix</span> 
                                {issue.suggestion}
                              </p>
                            )}

                            {issue.explanation && (
                              <div className="pt-5 border-t border-zinc-800/50">
                                <p className="text-xs uppercase tracking-widest font-bold text-blue-400 mb-2">Why this matters</p>
                                <p className="text-sm text-zinc-400 leading-relaxed break-words">{issue.explanation}</p>
                              </div>
                            )}
                            {issue.codeExample && (
                              <div className="mt-5 pt-5 border-t border-zinc-800/50">
                                <p className="text-xs uppercase tracking-widest font-bold text-brand mb-3">Better Approach</p>
                                <pre className="text-sm font-mono bg-[#050505] p-4 rounded-lg text-zinc-300 overflow-x-auto border border-zinc-800 whitespace-pre-wrap leading-relaxed shadow-inner">{issue.codeExample}</pre>
                              </div>
                            )}
                            {issue.docUrl && (
                              <a href={issue.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 text-sm text-brand hover:text-green-400 hover:underline font-bold transition-colors">
                                <ExternalLink className="w-4 h-4" /> Official Documentation
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {reviewResult.issues?.some((i: any) => i.affectedCode && i.fixedCode) && (
                    <button
                      onClick={() => handleDownloadAllFixes(currentReviewId!, selectedFile?.name || 'code.txt')}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-lg rounded-2xl transition-colors shadow-lg mt-4 border border-zinc-700"
                    >
                      <Download className="w-5 h-5" /> Download All AI Fixes as .patch
                    </button>
                  )}
                  
                  {(!reviewResult.issues || reviewResult.issues.length === 0) && (
                    <div className="bg-panel border border-brand/30 shadow-[0_0_40px_rgba(34,197,94,0.1)] rounded-2xl p-10 text-center flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-brand" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Clean Code!</h3>
                      <p className="text-zinc-400 text-base max-w-xs leading-relaxed">No critical issues or major inefficiencies detected in your implementation.</p>
                    </div>
                  )}

                  {/* Chatbot Integrated */}
                  <div className="mt-10 bg-panel border-2 border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl overflow-hidden shrink-0 shadow-xl">
                    <button
                      onClick={() => { setIsChatOpen(!isChatOpen); setChatMessages([]); }}
                      className="w-full flex items-center justify-between p-5 sm:p-6 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                           <MessageCircle className="w-5 h-5 text-brand" />
                        </div>
                        <div className="text-left">
                           <span className="block font-bold text-white text-lg">Ask AI Mentor</span>
                           <span className="block text-xs text-zinc-500 font-medium">Follow-ups on architecture, patterns, or optimization</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center">
                         {isChatOpen ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
                      </div>
                    </button>
                    
                    {isChatOpen && (
                      <div className="border-t border-zinc-800 bg-[#0a0a0a]">
                        <div className="max-h-80 overflow-y-auto p-6 space-y-5">
                          {chatMessages.length === 0 && (
                            <div className="flex flex-col gap-3 py-6">
                              {['How can I scale this architecture further?', 'Could you show me a Factory Pattern example?', 'Can you explain the Big-O complexity?'].map(q => (
                                <button key={q} onClick={() => { setChatInput(q); }} className="text-sm bg-panel text-white px-5 py-4 rounded-xl border border-zinc-800 hover:border-brand/50 hover:bg-brand/5 transition-all text-left font-medium">
                                  {q}
                                </button>
                              ))}
                            </div>
                          )}
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`text-[15px] leading-relaxed rounded-2xl py-3 px-5 max-w-[85%] ${msg.role === 'user' ? 'bg-brand text-black font-medium border-none' : 'bg-panel border border-zinc-800 text-zinc-300'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {isChatting && (
                            <div className="flex justify-start">
                              <div className="bg-panel border border-zinc-800 rounded-2xl py-4 px-6">
                                <span className="flex gap-1.5 items-center">
                                  <span className="w-2 h-2 rounded-full bg-brand/60 animate-bounce"></span>
                                  <span className="w-2 h-2 rounded-full bg-brand/60 animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                  <span className="w-2 h-2 rounded-full bg-brand/60 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                </span>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 bg-panel border-t border-zinc-800">
                          <div className="flex gap-3 bg-editor border border-zinc-700 rounded-xl p-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                            <input
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                              placeholder="Type your question..."
                              className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                            />
                            <button onClick={handleChatSend} disabled={isChatting || !chatInput.trim()} className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:hover:bg-white font-bold">
                              <Send className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </aside>
    </main>
  );
}
