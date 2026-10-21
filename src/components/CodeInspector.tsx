import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Search, 
  FolderTree, 
  Cpu, 
  Layers, 
  Terminal,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { NATIVE_FILES, NativeFile } from '../data/nativeSourceCode';

export const CodeInspector: React.FC = () => {
  const [activeFilePath, setActiveFilePath] = useState<string>('App.js');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = NATIVE_FILES.find(f => f.path === activeFilePath) || NATIVE_FILES[0];

  const filteredFiles = NATIVE_FILES.filter(f => 
    f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadActiveFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllAsJSON = () => {
    const fullProject = {
      project: "CapCut Native React Native Android Video Editor",
      architecture: "100% Native MediaCodec + Shopify Skia GPU + Reanimated",
      timestamp: new Date().toISOString(),
      files: NATIVE_FILES
    };
    const blob = new Blob([JSON.stringify(fullProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'capcut-react-native-android-project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group files by category
  const categories = [
    { key: 'react-native', label: 'React Native Core', icon: Layers },
    { key: 'components', label: 'Timeline & Skia Components', icon: Cpu },
    { key: 'android', label: 'Android Gradle & Manifest', icon: Terminal },
    { key: 'native-modules', label: 'Hardware Codec Bridge', icon: FileCode },
    { key: 'config', label: 'Package & Metro Config', icon: FolderTree },
    { key: 'docs', label: 'Architecture & Media Setup', icon: BookOpen },
  ];

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex flex-col lg:flex-row h-[740px] bg-[#0c0c0e] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
      
      {/* LEFT: File Explorer Tree */}
      <div className="w-full lg:w-80 bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0">
        
        {/* Explorer Header */}
        <div className="p-4 border-b border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderTree size={16} className="text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Project Files Tree
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700">
              {NATIVE_FILES.length} Files
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter native files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition font-mono"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {categories.map((cat) => {
            const catFiles = filteredFiles.filter(f => f.category === cat.key);
            if (catFiles.length === 0) return null;
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <Icon size={12} className="text-zinc-400" />
                  <span>{cat.label}</span>
                </div>

                <div className="space-y-0.5">
                  {catFiles.map((file) => {
                    const isActive = file.path === activeFilePath;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setActiveFilePath(file.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition font-mono ${
                          isActive
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode size={13} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                          <span className="truncate">{file.filename}</span>
                        </div>
                        {isActive && <ChevronRight size={13} className="text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explorer Footer Action */}
        <div className="p-3 border-t border-zinc-800 bg-[#0c0c0e]">
          <button
            onClick={handleDownloadAllAsJSON}
            className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-zinc-700"
          >
            <Download size={13} className="text-cyan-400" />
            <span>Download Full Project (.json)</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Code Viewer & Actions */}
      <div className="flex-1 flex flex-col bg-[#09090b] overflow-hidden">
        
        {/* Top File Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-zinc-800 bg-[#0d0d10]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {activeFile.path}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-cyan-400 border border-zinc-700">
                {activeFile.language}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
              {activeFile.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadActiveFile}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 border border-zinc-700 transition"
              title="Download this file"
            >
              <Download size={13} />
              <span className="text-[11px]">Save</span>
            </button>

            <button
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 overflow-auto p-4 bg-[#09090b] font-mono text-xs leading-relaxed">
          <div className="flex min-w-full">
            {/* Line numbers */}
            <div className="select-none pr-4 text-right text-zinc-600 border-r border-zinc-800 shrink-0 font-mono text-[11px]">
              {lines.map((_, i) => (
                <div key={i} className="leading-5">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code lines */}
            <pre className="pl-4 text-zinc-200 overflow-x-auto flex-1 font-mono text-[11px] leading-5">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="px-6 py-2 border-t border-zinc-800 bg-[#0c0c0e] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>{lines.length} lines • UTF-8</span>
          <span className="text-cyan-400">Android MediaCodec • Skia SkSL • Reanimated 3</span>
        </div>
      </div>
    </div>
  );
};
