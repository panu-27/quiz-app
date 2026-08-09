import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const MOCK_PDF_QUESTIONS = [
    { num: 1, q: "A particle is moving in a circle of radius R with a constant speed v. The change in velocity when the particle describes an angle of 60° is:", opts: ["v", "v √2", "v √3", "2v"], ans: "A" },
    { num: 2, q: "The focal length of a biconvex lens of refractive index 1.5 is 20 cm. If it is immersed in water of refractive index 1.33, its focal length will become:", opts: ["20 cm", "40 cm", "80 cm", "10 cm"], ans: "C" },
];

export default function PdfViewerPage() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { source, id } = useParams();
    
    // State passed via router
    const { pdfUrl, title, date, questions } = location.state || {};

    const [pdfZoom, setPdfZoom] = useState(100);
    const [viewerReady, setViewerReady] = useState(false);

    const goal = localStorage.getItem("selectedGoal") || "MHT CET";

    const resolveFileUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        const base = window.__API_URL__ ? window.__API_URL__.replace(/\/api$/, '') : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
        return `${base}${url}`;
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const url = resolveFileUrl(pdfUrl);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || 'Document'}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors ${theme === 'light' ? 'bg-[#F4F7FC]' : 'bg-[#0B101A]'}`}>
            {/* Viewer Toolbar */}
            <div className={`h-14 flex items-center justify-between px-2 border-b flex-shrink-0 pt-safe ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B101A] border-[#1e293b]'}`}>
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 flex items-center justify-center flex-shrink-0 bg-transparent outline-none ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <p className={`text-[14px] font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {title || 'Document'}.pdf
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 mr-2 rounded border shadow-none flex-shrink-0 ${theme === 'light' ? 'border-slate-300 text-slate-700 active:bg-slate-50' : 'border-slate-700 text-slate-200 active:bg-white/5'}`}
                >
                    <ArrowDownTrayIcon className="w-[15px] h-[15px]" strokeWidth={2} />
                    <span className="text-[12px] font-bold">Download</span>
                </button>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#1E1E1E',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {source === 'pyq' && !pdfUrl ? (
                    /* Mock high-fidelity view for PYQ */
                    <div style={{ padding: '24px 16px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: 450,
                            aspectRatio: '1 / 1.414',
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            padding: '30px 24px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            transform: `scale(${pdfZoom / 100})`,
                            transformOrigin: 'top center',
                        }}>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                fontSize: 40, fontWeight: 900, color: 'rgba(29, 78, 216, 0.04)',
                                whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none'
                            }}>
                                {goal.toUpperCase()} EXPLORER
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: 8, marginBottom: 16 }}>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{goal} PYQ</span>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{date}</span>
                            </div>
                            <h2 style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
                                {title}
                            </h2>
                            <p style={{ fontSize: 9, color: '#666666', textAlign: 'center', marginBottom: 16 }}>
                                PHYSICS, CHEMISTRY & MATHEMATICS PAPER
                            </p>
                            <div style={{ border: '1px solid #CCCCCC', padding: 10, borderRadius: 4, marginBottom: 16 }}>
                                <h3 style={{ fontSize: 9, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>Important Instructions:</h3>
                                <ul style={{ fontSize: 8, color: '#333333', paddingLeft: 12, margin: 0, listStyleType: 'decimal' }}>
                                    <li>This question paper contains {questions || 150} questions in total.</li>
                                    <li>All questions are compulsory. There is no negative marking for MHT CET.</li>
                                    <li>For each question, select the option corresponding to the correct answer.</li>
                                </ul>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontWeight: 800, lineHeight: 1.4 }}>
                                    Q{MOCK_PDF_QUESTIONS[0].num}. {MOCK_PDF_QUESTIONS[0].q}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, paddingLeft: 8 }}>
                                    {MOCK_PDF_QUESTIONS[0].opts.map((opt, oIdx) => (
                                        <div key={oIdx} style={{ fontSize: 9.5, fontWeight: 600 }}>({String.fromCharCode(65 + oIdx)}) {opt}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Iframe View for PDF Urls (like Library) */
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {!viewerReady && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        )}
                        {pdfUrl ? (
                            <iframe 
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(pdfUrl))}&embedded=true`} 
                                className={`w-full h-full border-none transition-opacity duration-500 ${viewerReady ? 'opacity-100' : 'opacity-0'}`} 
                                title="Document Viewer" 
                                onLoad={() => setViewerReady(true)} 
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-sm font-bold text-slate-400">Document not found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
