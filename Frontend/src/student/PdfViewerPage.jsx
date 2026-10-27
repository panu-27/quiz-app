import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, RotateCw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { useTheme } from '../context/ThemeContext';
import useBackButton from '../hooks/useBackButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const MIN_ZOOM = 1; // 100% = full device width; can't zoom out past it
const MAX_ZOOM = 3.5;
const DOUBLE_TAP_ZOOM = 2;
const HEADER_H = 56;
const STATUS_BAR_H = 28.5;
const TOP_OFFSET = STATUS_BAR_H + 12;
const HEADER_TOTAL_H = TOP_OFFSET + HEADER_H;

/* Monochrome palette */
const PALETTE = {
    dark: {
        root: '#0a0a0a',
        canvasBg: '#121212',
        bar: 'rgba(10,10,10,0.82)',
        border: 'rgba(255,255,255,0.10)',
        text: '#fafafa',
        muted: 'rgba(250,250,250,0.55)',
        hover: 'rgba(255,255,255,0.10)',
        pageShadow: '0 1px 2px rgba(0,0,0,0.6), 0 12px 32px -12px rgba(0,0,0,0.8)',
    },
    light: {
        root: '#ffffff',
        canvasBg: '#efefef',
        bar: 'rgba(255,255,255,0.86)',
        border: 'rgba(0,0,0,0.10)',
        text: '#0a0a0a',
        muted: 'rgba(10,10,10,0.55)',
        hover: 'rgba(0,0,0,0.06)',
        pageShadow: '0 1px 2px rgba(0,0,0,0.10), 0 12px 32px -12px rgba(0,0,0,0.25)',
    },
};

const MOCK_PDF_QUESTIONS = [
    { num: 1, q: "A particle is moving in a circle of radius R with a constant speed v. The change in velocity when the particle describes an angle of 60° is:", opts: ["v", "v √2", "v √3", "2v"], ans: "A" },
    { num: 2, q: "The focal length of a biconvex lens of refractive index 1.5 is 20 cm. If it is immersed in water of refractive index 1.33, its focal length will become:", opts: ["20 cm", "40 cm", "80 cm", "10 cm"], ans: "C" },
];

/* ══════════════════════════════════════════════════════════
   Single PDF page → canvas (lazy rendered, memory-friendly)
══════════════════════════════════════════════════════════ */
function PdfPage({ pdf, pageNum, cssWidth, root, pageShadow }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const taskRef = useRef(null);
    const [ratio, setRatio] = useState(1.414);
    const [visible, setVisible] = useState(false);

    // Page aspect ratio so layout is stable before render
    useEffect(() => {
        let alive = true;
        pdf.getPage(pageNum).then((p) => {
            if (!alive) return;
            const vp = p.getViewport({ scale: 1 });
            setRatio(vp.height / vp.width);
        });
        return () => { alive = false; };
    }, [pdf, pageNum]);

    // Only render pages near the viewport
    useEffect(() => {
        if (!wrapRef.current || !root) return;
        const io = new IntersectionObserver(
            ([e]) => setVisible(e.isIntersecting),
            { root, rootMargin: '900px 0px' }
        );
        io.observe(wrapRef.current);
        return () => io.disconnect();
    }, [root]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Off-screen: free the bitmap memory
        if (!visible || !cssWidth) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }

        let alive = true;
        (async () => {
            const page = await pdf.getPage(pageNum);
            if (!alive) return;
            const base = page.getViewport({ scale: 1 });
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const targetW = Math.min(cssWidth * dpr, 3000);
            const viewport = page.getViewport({ scale: targetW / base.width });

            // Render offscreen, then swap — no white flash on re-render
            const off = document.createElement('canvas');
            off.width = Math.floor(viewport.width);
            off.height = Math.floor(viewport.height);
            const task = page.render({ canvasContext: off.getContext('2d'), viewport });
            taskRef.current = task;
            try {
                await task.promise;
            } catch (_) {
                return; // cancelled
            }
            if (!alive || !canvasRef.current) return;
            const c = canvasRef.current;
            c.width = off.width;
            c.height = off.height;
            c.getContext('2d').drawImage(off, 0, 0);
        })();

        return () => {
            alive = false;
            taskRef.current?.cancel();
        };
    }, [visible, pdf, pageNum, cssWidth]);

    return (
        <div
            ref={wrapRef}
            data-page-num={pageNum}
            style={{
                width: cssWidth,
                height: Math.round(cssWidth * ratio),
                background: '#fff',
                marginBottom: 10,
                borderRadius: 2,
                boxShadow: pageShadow,
                overflow: 'hidden',
            }}
        >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   Scroll + pinch-zoom + double-tap-zoom PDF canvas viewer
   (zoom affects only the document, never the app page)
══════════════════════════════════════════════════════════ */
function PdfCanvasViewer({
    url,
    zoom = 1,
    onZoomChange,
    onPageChange,
    onLoadSuccess,
    onScrollDirection,
    topPad = HEADER_TOTAL_H + 16,
    bottomPad = 96,
    onReady,
    onError,
}) {
    const { theme } = useTheme();
    const colors = theme === 'light' ? PALETTE.light : PALETTE.dark;

    const [scroller, setScroller] = useState(null);
    const contentRef = useRef(null);
    const [pdf, setPdf] = useState(null);
    const [baseWidth, setBaseWidth] = useState(0);
    const zoomRef = useRef(zoom);

    useEffect(() => {
        zoomRef.current = zoom;
    }, [zoom]);

    // Lock the page behind so only the PDF scrolls
    useEffect(() => {
        const prevB = document.body.style.overflow;
        const prevH = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevB;
            document.documentElement.style.overflow = prevH;
        };
    }, []);

    // Load document
    useEffect(() => {
        if (!url) return;
        let isCancelled = false;
        const task = pdfjsLib.getDocument({ url, verbosity: 0 });
        let doc = null;
        task.promise
            .then((d) => {
                if (isCancelled) {
                    try { d.destroy(); } catch (_) { }
                    return;
                }
                doc = d;
                setPdf(d);
                onLoadSuccess?.({ numPages: d.numPages });
                onReady?.();
            })
            .catch((e) => {
                if (isCancelled || e?.name === 'AbortException' || e?.message?.includes('aborted')) return;
                console.error('PDF load failed', e);
                onError?.(e);
            });
        return () => {
            isCancelled = true;
            try { task.destroy(); } catch (_) { }
            try { doc?.destroy(); } catch (_) { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Responsive base width
    useEffect(() => {
        if (!scroller) return;
        const update = () => {
            const clientW = scroller.clientWidth;
            if (!clientW) return;
            // 100% = the full width of the device; on wide screens cap it so lines stay readable
            setBaseWidth(clientW < 840 ? clientW : 840);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(scroller);
        return () => ro.disconnect();
    }, [scroller]);

    // Scroll direction → hide header on scroll down, show on scroll up
    useEffect(() => {
        if (!scroller) return;
        let last = scroller.scrollTop;
        const onScroll = () => {
            const top = scroller.scrollTop;
            const diff = top - last;
            if (top < 24) {
                onScrollDirection?.(false);
            } else if (Math.abs(diff) > 8) {
                onScrollDirection?.(diff > 0);
            } else {
                return;
            }
            last = top;
        };
        scroller.addEventListener('scroll', onScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', onScroll);
    }, [scroller, onScrollDirection]);

    // Track the page currently in view
    useEffect(() => {
        if (!scroller || !pdf) return;
        const pageEls = scroller.querySelectorAll('[data-page-num]');
        if (!pageEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            let maxRatio = 0;
            let bestPage = null;
            entries.forEach((entry) => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    bestPage = Number(entry.target.getAttribute('data-page-num'));
                }
            });
            if (bestPage && maxRatio > 0.15) onPageChange?.(bestPage);
        }, { root: scroller, threshold: [0.15, 0.35, 0.55, 0.75] });

        pageEls.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [scroller, pdf, onPageChange]);

    // Desktop: Ctrl + wheel / trackpad pinch zooms the document only
    useEffect(() => {
        const el = scroller;
        if (!el) return;

        const handleWheel = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault(); // stops browser page zoom
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            const targetZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((zoomRef.current * factor).toFixed(2))));
            if (targetZoom === zoomRef.current) return;

            const r = el.getBoundingClientRect();
            const fx = e.clientX - r.left;
            const fy = e.clientY - r.top;
            const z = zoomRef.current;
            const cx = (el.scrollLeft + fx) / z;
            const cy = (el.scrollTop + fy) / z;

            zoomRef.current = targetZoom;
            onZoomChange?.(targetZoom);
            requestAnimationFrame(() => {
                el.scrollLeft = cx * targetZoom - fx;
                el.scrollTop = cy * targetZoom - fy;
            });
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [scroller, onZoomChange]);

    // Desktop: double click toggles zoom
    const handleDoubleClick = (e) => {
        if (!scroller) return;
        const r = scroller.getBoundingClientRect();
        const fx = e.clientX - r.left;
        const fy = e.clientY - r.top;
        const z = zoomRef.current;
        const targetZoom = z > 1.05 ? 1 : DOUBLE_TAP_ZOOM;
        const cx = (scroller.scrollLeft + fx) / z;
        const cy = (scroller.scrollTop + fy) / z;

        zoomRef.current = targetZoom;
        onZoomChange?.(targetZoom);
        requestAnimationFrame(() => {
            scroller.scrollLeft = cx * targetZoom - fx;
            scroller.scrollTop = cy * targetZoom - fy;
        });
    };

    // Touch: pinch + double-tap
    useEffect(() => {
        const el = scroller;
        if (!el) return;

        const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        let pinch = null;
        let tap = null;
        let lastTap = null;

        const commitZoom = (nz, fx, fy, cx, cy) => {
            const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nz.toFixed(2))));
            zoomRef.current = clamped;
            onZoomChange?.(clamped);
            if (contentRef.current) contentRef.current.style.transform = '';
            requestAnimationFrame(() => {
                el.scrollLeft = cx * clamped - fx;
                el.scrollTop = cy * clamped - fy;
            });
        };

        const start = (e) => {
            if (e.touches.length === 2) {
                tap = null;
                const r = el.getBoundingClientRect();
                const z = zoomRef.current;
                const fx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
                const fy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
                pinch = {
                    d: dist(e.touches), z, fx, fy, s: 1,
                    cx: (el.scrollLeft + fx) / z,
                    cy: (el.scrollTop + fy) / z,
                };
            } else if (e.touches.length === 1 && !pinch) {
                tap = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), moved: false };
            }
        };

        const move = (e) => {
            if (pinch && e.touches.length === 2) {
                if (e.cancelable) e.preventDefault();
                const factor = dist(e.touches) / pinch.d;
                const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinch.z * factor));
                pinch.s = nz / pinch.z;
                if (contentRef.current) {
                    contentRef.current.style.transformOrigin = `${pinch.fx}px ${pinch.fy}px`;
                    contentRef.current.style.transform = `scale(${pinch.s})`;
                }
            } else if (tap && e.touches.length === 1) {
                const dx = e.touches[0].clientX - tap.x;
                const dy = e.touches[0].clientY - tap.y;
                if (Math.hypot(dx, dy) > 10) tap.moved = true;
            }
        };

        const end = (e) => {
            if (pinch) {
                if (e.touches.length < 2) {
                    const p = pinch;
                    pinch = null;
                    if (contentRef.current) contentRef.current.style.transform = '';
                    commitZoom(p.z * p.s, p.fx, p.fy, p.cx, p.cy);
                }
                tap = null;
                return;
            }

            if (tap && !tap.moved && e.touches.length === 0 && Date.now() - tap.t < 250) {
                const now = Date.now();
                if (lastTap && now - lastTap.t < 300 && Math.hypot(tap.x - lastTap.x, tap.y - lastTap.y) < 30) {
                    const r = el.getBoundingClientRect();
                    const fx = tap.x - r.left;
                    const fy = tap.y - r.top;
                    const z = zoomRef.current;
                    const nz = z > 1.05 ? 1 : DOUBLE_TAP_ZOOM;
                    commitZoom(nz, fx, fy, (el.scrollLeft + fx) / z, (el.scrollTop + fy) / z);
                    lastTap = null;
                } else {
                    lastTap = { x: tap.x, y: tap.y, t: now };
                }
            }
            tap = null;
        };

        el.addEventListener('touchstart', start, { passive: true });
        el.addEventListener('touchmove', move, { passive: false });
        el.addEventListener('touchend', end, { passive: true });
        el.addEventListener('touchcancel', end, { passive: true });
        return () => {
            el.removeEventListener('touchstart', start);
            el.removeEventListener('touchmove', move);
            el.removeEventListener('touchend', end);
            el.removeEventListener('touchcancel', end);
        };
    }, [scroller, onZoomChange]);

    const cssWidth = Math.round(baseWidth * zoom);

    return (
        <div
            ref={setScroller}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                /* No "pinch-zoom" here: the browser must not zoom the app page.
                   Pinch is handled manually above and scales only the PDF. */
                touchAction: 'pan-x pan-y',
                backgroundColor: colors.canvasBg,
            }}
        >
            {pdf && baseWidth > 0 && (
                <div
                    ref={contentRef}
                    style={{
                        width: cssWidth,
                        margin: '0 auto',
                        paddingTop: topPad,
                        paddingBottom: bottomPad,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        willChange: 'transform',
                    }}
                >
                    {Array.from({ length: pdf.numPages }, (_, i) => (
                        <PdfPage
                            key={i}
                            pdf={pdf}
                            pageNum={i + 1}
                            cssWidth={cssWidth}
                            root={scroller}
                            pageShadow={colors.pageShadow}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function PdfViewerPage({
    pdfUrl: propPdfUrl,
    title: propTitle,
    onClose,
} = {}) {
    const { theme } = useTheme();
    const colors = theme === 'light' ? PALETTE.light : PALETTE.dark;
    const navigate = useNavigate();
    const location = useLocation();
    const { source } = useParams();

    const searchParams = new URLSearchParams(location.search);
    const stateData = location.state || {};
    const pdfUrl = propPdfUrl || stateData.pdfUrl || searchParams.get('url');
    const title = propTitle || stateData.title || searchParams.get('title') || '';
    const date = stateData.date || '';
    const questions = stateData.questions;

    const [zoom, setZoom] = useState(1);
    const [viewerReady, setViewerReady] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);

    const handleBack = () => {
        if (onClose) {
            onClose();
            return true;
        }
        const fromPath = stateData.from || (source === 'pyq' || location.pathname.includes('/pyq') ? '/student/pyq' : '/student/library');
        navigate(fromPath, { replace: true });
        return true;
    };

    useBackButton(handleBack);

    // Viewer typeface
    useEffect(() => {
        if (document.getElementById('pdf-viewer-font')) return;
        const l = document.createElement('link');
        l.id = 'pdf-viewer-font';
        l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap';
        document.head.appendChild(l);
    }, []);

    // Hide bottom nav while PDF is open
    useEffect(() => {
        document.body.setAttribute('data-hide-nav', 'true');
        return () => document.body.removeAttribute('data-hide-nav');
    }, []);

    const goal = localStorage.getItem('selectedGoal') || 'MHT CET';

    const resolveFileUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        const base = window.__API_URL__ ? window.__API_URL__.replace(/\/api$/, '') : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
        return `${base}${url}`;
    };

    const resolvedUrl = resolveFileUrl(pdfUrl);

    useEffect(() => {
        setViewerReady(false);
        setLoadError(null);
        setZoom(1);
        setCurrentPage(1);
        setNumPages(0);
    }, [resolvedUrl]);

    const fileName = title ? `${title}.pdf` : 'Document.pdf';
    const subtitle = questions ? `${questions} questions` : numPages ? `${numPages} pages` : '';

    return (
        <div
            className="fixed inset-0 z-[99999] flex flex-col select-none overflow-hidden"
            style={{ background: colors.root, color: colors.text, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
        >
            {/* Header — permanently fixed at top; never hidden on scroll */}
            <header
                className="absolute top-0 left-0 right-0 z-50 flex items-center gap-2 px-3 sm:px-5"
                style={{
                    paddingTop: TOP_OFFSET,
                    paddingBottom: 8,
                    minHeight: HEADER_TOTAL_H,
                    background: colors.bar,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderBottom: `1px solid ${colors.border}`,
                }}
            >
                <button
                    onClick={handleBack}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 focus:outline-none"
                    style={{ color: colors.text }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    aria-label="Back"
                >
                    <ArrowLeft size={20} strokeWidth={1.75} />
                </button>
                <div className="min-w-0 leading-tight">
                    <span
                        className="block text-[14.5px] font-medium truncate tracking-tight"
                        title={fileName}
                    >
                        {fileName}
                    </span>
                    {subtitle && (
                        <span className="block text-[11.5px]" style={{ color: colors.muted }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </header>

            {/* Document area */}
            <div className="pdf-viewer-container flex-1 w-full relative" style={{ background: colors.canvasBg }}>
                {source === 'pyq' && !pdfUrl ? (
                    <div style={{ padding: '24px 16px', paddingTop: HEADER_TOTAL_H + 24, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: 450,
                            aspectRatio: '1 / 1.414',
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            padding: '30px 24px',
                            boxShadow: colors.pageShadow,
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                fontSize: 40, fontWeight: 900, color: 'rgba(0, 0, 0, 0.04)',
                                whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
                            }}>
                                {goal.toUpperCase()} EXPLORER
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: 8, marginBottom: 16 }}>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{goal} PYQ</span>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{date}</span>
                            </div>
                            <h2 style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>{title}</h2>
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
                ) : pdfUrl && loadError ? (
                    <>
                        <div style={{ position: 'absolute', top: HEADER_TOTAL_H + 10, left: 12, right: 12, zIndex: 41, pointerEvents: 'none' }}>
                            <p
                                style={{
                                    fontSize: 11,
                                    color: colors.muted,
                                    background: colors.bar,
                                    border: `1px solid ${colors.border}`,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    display: 'inline-block',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                }}
                            >
                                Fallback viewer: {loadError}
                            </p>
                        </div>
                        <iframe
                            src={`${resolvedUrl}#toolbar=0&navpanes=0`}
                            title="Document Viewer"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', paddingTop: HEADER_TOTAL_H, background: colors.canvasBg }}
                        />
                    </>
                ) : pdfUrl ? (
                    <>
                        {!viewerReady && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                                <Loader2 className="w-7 h-7 animate-spin" style={{ color: colors.muted }} strokeWidth={1.75} />
                            </div>
                        )}
                        <PdfCanvasViewer
                            url={resolvedUrl}
                            zoom={zoom}
                            onZoomChange={setZoom}
                            onPageChange={setCurrentPage}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            onReady={() => setViewerReady(true)}
                            onError={(e) => setLoadError(e?.message || String(e) || 'unknown error')}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                        <FileText size={44} strokeWidth={1.5} style={{ color: colors.muted }} className="mb-3" />
                        <p className="text-sm font-medium" style={{ color: colors.muted }}>Document not found</p>
                    </div>
                )}

                {/* Floating dock — page number, zoom badge, rotate option */}
                {numPages > 0 && !loadError && (
                    <div
                        className="absolute left-1/2 z-40 flex items-center overflow-hidden rounded-full shadow-lg"
                        style={{
                            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)',
                            transform: 'translateX(-50%)',
                            height: 40,
                            background: colors.bar,
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            border: `1px solid ${colors.border}`,
                            boxShadow: colors.pageShadow,
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: 13,
                        }}
                    >
                        <div className="px-[18px] whitespace-nowrap pointer-events-none" style={{ color: colors.muted }}>
                            <span style={{ color: colors.text, fontWeight: 600 }}>{currentPage}</span>
                            <span className="mx-1.5 opacity-60">/</span>
                            <span>{numPages}</span>
                        </div>
                        {zoom > 1.04 && (
                            <button
                                onClick={() => setZoom(1)}
                                className="h-full px-3.5 font-semibold focus:outline-none active:opacity-60"
                                style={{ color: colors.text, borderLeft: `1px solid ${colors.border}` }}
                                aria-label="Reset zoom"
                            >
                                {Math.round(zoom * 100)}%
                            </button>
                        )}
                        {/* Visual rotate button */}
                        <button
                            type="button"
                            className="h-full px-3.5 flex items-center justify-center transition-colors hover:opacity-80 active:scale-95 focus:outline-none"
                            style={{ color: colors.text, borderLeft: `1px solid ${colors.border}` }}
                            title="Rotate (Visual)"
                            aria-label="Rotate"
                        >
                            <RotateCw size={15} strokeWidth={1.8} />
                        </button>
                        <div
                            className="absolute left-0 bottom-0 pointer-events-none"
                            style={{
                                height: 2,
                                width: `${(currentPage / numPages) * 100}%`,
                                background: colors.text,
                                opacity: 0.8,
                                transition: 'width 0.15s',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}