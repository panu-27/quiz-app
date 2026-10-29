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
function PdfPage({
    pdf,
    pageNum,
    isLandscape = false,
    zoom = 1,
    availW = 800,
    availH = 600,
    baseW = 800,
    root,
    pageShadow,
}) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const taskRef = useRef(null);
    const [ratio, setRatio] = useState(isLandscape ? 0.707 : 1.414);
    const [visible, setVisible] = useState(false);

    // Page aspect ratio so layout is stable before render
    useEffect(() => {
        let alive = true;
        pdf.getPage(pageNum).then((p) => {
            if (!alive) return;
            const rot = (p.rotate + (isLandscape ? 90 : 0)) % 360;
            const vp = p.getViewport({ scale: 1, rotation: rot });
            setRatio(vp.height / vp.width);
        });
        return () => { alive = false; };
    }, [pdf, pageNum, isLandscape]);

    // Only render pages near the viewport (both horizontal and vertical margin)
    useEffect(() => {
        if (!wrapRef.current || !root) return;
        const io = new IntersectionObserver(
            ([e]) => setVisible(e.isIntersecting),
            { root, rootMargin: '900px 900px' }
        );
        io.observe(wrapRef.current);
        return () => io.disconnect();
    }, [root]);

    // Calculate dimensions
    let basePageW = 0;
    let basePageH = 0;
    if (isLandscape) {
        let pw = availW;
        let ph = pw * ratio;
        if (ph > availH) {
            ph = availH;
            pw = ph / ratio;
        }
        basePageW = Math.round(pw);
        basePageH = Math.round(ph);
    } else {
        basePageW = Math.round(baseW);
        basePageH = Math.round(baseW * ratio);
    }

    const pageWidth = Math.round(basePageW * zoom);
    const pageHeight = Math.round(basePageH * zoom);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Off-screen: free the bitmap memory
        if (!visible || !basePageW || !basePageH) {
            canvas.width = 0;
            canvas.height = 0;
            return;
        }

        let alive = true;
        (async () => {
            const page = await pdf.getPage(pageNum);
            if (!alive) return;
            const rot = (page.rotate + (isLandscape ? 90 : 0)) % 360;
            const base = page.getViewport({ scale: 1, rotation: rot });
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            // Render at crisp 2x retina print resolution (independent of temporary zoom changes)
            const targetW = Math.min(Math.round(basePageW * dpr * 1.5), 1800);
            const viewport = page.getViewport({ scale: targetW / base.width, rotation: rot });

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
    }, [visible, pdf, pageNum, isLandscape, basePageW, basePageH]);

    return (
        <div
            ref={wrapRef}
            data-page-num={pageNum}
            style={{
                width: pageWidth,
                height: pageHeight,
                flexShrink: 0,
                background: '#fff',
                marginBottom: isLandscape ? 0 : 10,
                borderRadius: 2,
                boxShadow: pageShadow,
                overflow: 'hidden',
                scrollSnapAlign: isLandscape && zoom <= 1.05 ? 'center' : 'none',
                scrollSnapStop: 'normal',
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
    isLandscape = false,
    currentPage = 1,
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
    const [containerSize, setContainerSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600,
    });
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

    // Responsive container size
    useEffect(() => {
        if (!scroller) return;
        const update = () => {
            if (scroller.clientWidth && scroller.clientHeight) {
                setContainerSize({
                    width: scroller.clientWidth,
                    height: scroller.clientHeight,
                });
            }
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(scroller);
        return () => ro.disconnect();
    }, [scroller]);

    // Scroll direction → hide header on scroll down, show on scroll up (vertical mode)
    useEffect(() => {
        if (!scroller || isLandscape) return;
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
    }, [scroller, onScrollDirection, isLandscape]);

    // Track latest current page in a ref
    const currentPageRef = useRef(currentPage);
    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    // Flag to suppress intersection observer during orientation reflow
    const isTransitioningRef = useRef(false);

    // Track the page currently in view
    useEffect(() => {
        if (!scroller || !pdf) return;
        const pageEls = scroller.querySelectorAll('[data-page-num]');
        if (!pageEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            if (isTransitioningRef.current) return;
            let maxRatio = 0;
            let bestPage = null;
            entries.forEach((entry) => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    bestPage = Number(entry.target.getAttribute('data-page-num'));
                }
            });
            if (bestPage && maxRatio > 0.15 && !isTransitioningRef.current) {
                onPageChange?.(bestPage);
            }
        }, { root: scroller, threshold: [0.15, 0.35, 0.55, 0.75] });

        pageEls.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [scroller, pdf, onPageChange, isLandscape]);

    // Keep EXACT same page in view when orientation toggles and reset zoom
    const prevLandscapeRef = useRef(isLandscape);
    useEffect(() => {
        if (prevLandscapeRef.current !== isLandscape && scroller) {
            prevLandscapeRef.current = isLandscape;
            zoomRef.current = 1;
            isTransitioningRef.current = true;

            if (contentRef.current) {
                contentRef.current.style.transform = '';
                contentRef.current.style.transformOrigin = '';
            }

            const targetPage = currentPageRef.current || 1;

            // Wait two frames for layout to compute new element positions
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!scroller) return;
                    scroller.style.scrollSnapType = 'none';

                    const targetEl = scroller.querySelector(`[data-page-num="${targetPage}"]`);
                    if (targetEl) {
                        if (isLandscape) {
                            // Horizontal mode (RTL): center target page horizontally
                            targetEl.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                            scroller.scrollTop = 0;
                        } else {
                            // Vertical mode: align vertically to target page
                            const elTop = targetEl.offsetTop;
                            const elHeight = targetEl.offsetHeight;
                            const targetScroll = targetPage === 1 ? 0 : elTop - (scroller.clientHeight - elHeight) / 2;
                            scroller.scrollTop = Math.max(0, targetScroll);
                            scroller.scrollLeft = 0;
                        }
                    }

                    // Re-enable observer and snap after layout settles
                    setTimeout(() => {
                        if (scroller) {
                            scroller.style.scrollSnapType = '';
                        }
                        isTransitioningRef.current = false;
                        onPageChange?.(targetPage);
                    }, 250);
                });
            });
        }
    }, [isLandscape, scroller, onPageChange]);

    // Desktop: Ctrl + wheel / trackpad pinch zooms the document only.
    // In landscape mode: vertical wheel scrolls horizontally between pages!
    useEffect(() => {
        const el = scroller;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.ctrlKey) {
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
                return;
            }

            // In horizontal mode, map vertical wheel to horizontal scroll so pages advance (reversed: upcoming from left)
            if (isLandscape) {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    el.scrollLeft -= e.deltaY;
                }
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [scroller, onZoomChange, isLandscape]);

    // Keyboard navigation (Arrow keys - reversed in horizontal mode so upcoming pages come from left)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!scroller || !isLandscape) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                scroller.scrollBy({ left: 320, behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                scroller.scrollBy({ left: -320, behavior: 'smooth' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scroller, isLandscape]);

    // Desktop: double click toggles zoom
    const handleDoubleClick = (e) => {
        if (!scroller) return;
        const r = scroller.getBoundingClientRect();
        const fx = e.clientX - r.left;
        const fy = e.clientY - r.top;
        const z = zoomRef.current;
        const targetZoom = z > 1.05 ? 1 : DOUBLE_TAP_ZOOM;
        const docX = (scroller.scrollLeft + fx) / z;
        const docY = (scroller.scrollTop + fy) / z;

        zoomRef.current = targetZoom;
        onZoomChange?.(targetZoom);
        requestAnimationFrame(() => {
            scroller.scrollLeft = isLandscape ? (docX * targetZoom - fx) : Math.max(0, docX * targetZoom - fx);
            scroller.scrollTop = Math.max(0, docY * targetZoom - fy);
        });
    };

    // Touch: pinch + double-tap (smooth 60fps GPU preview, anchored directly to fingers)
    useEffect(() => {
        const el = scroller;
        if (!el) return;

        const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        let pinch = null;
        let tap = null;
        let lastTap = null;

        const commitZoom = (targetZoom, anchorDocX, anchorDocY, screenX, screenY) => {
            const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(targetZoom.toFixed(2))));
            zoomRef.current = clamped;
            onZoomChange?.(clamped);

            if (contentRef.current) {
                contentRef.current.style.transform = '';
                contentRef.current.style.transformOrigin = '';
                contentRef.current.style.willChange = '';
            }

            requestAnimationFrame(() => {
                el.scrollLeft = isLandscape ? (anchorDocX * clamped - screenX) : Math.max(0, anchorDocX * clamped - screenX);
                el.scrollTop = Math.max(0, anchorDocY * clamped - screenY);
            });
        };

        const start = (e) => {
            if (e.touches.length === 2) {
                if (e.cancelable) e.preventDefault();
                tap = null;

                const r = el.getBoundingClientRect();
                const z = zoomRef.current;
                const d = dist(e.touches);
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const screenX = midX - r.left;
                const screenY = midY - r.top;

                const startScrollX = el.scrollLeft;
                const startScrollY = el.scrollTop;

                // Point in content coordinates
                const anchorContentX = startScrollX + screenX;
                const anchorContentY = startScrollY + screenY;

                pinch = {
                    d,
                    z,
                    startScrollX,
                    startScrollY,
                    screenX,
                    screenY,
                    anchorContentX,
                    anchorContentY,
                    anchorDocX: anchorContentX / z,
                    anchorDocY: anchorContentY / z,
                    currDist: d,
                    currScreenX: screenX,
                    currScreenY: screenY,
                    targetZoom: z,
                };

                if (contentRef.current) {
                    contentRef.current.style.willChange = 'transform';
                }
            } else if (e.touches.length === 1 && !pinch) {
                tap = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), moved: false };
            }
        };

        const move = (e) => {
            if (pinch && e.touches.length === 2) {
                if (e.cancelable) e.preventDefault();
                const d = dist(e.touches);
                const r = el.getBoundingClientRect();
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const currScreenX = midX - r.left;
                const currScreenY = midY - r.top;

                pinch.currDist = d;
                pinch.currScreenX = currScreenX;
                pinch.currScreenY = currScreenY;

                const scaleFactor = d / pinch.d;
                const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinch.z * scaleFactor));
                pinch.targetZoom = newZoom;
                const s = newZoom / pinch.z;

                // Transform relative to 0 0 so content scales and follows fingers with zero drift
                const tx = currScreenX - (pinch.anchorContentX * s - pinch.startScrollX);
                const ty = currScreenY - (pinch.anchorContentY * s - pinch.startScrollY);

                if (contentRef.current) {
                    contentRef.current.style.transformOrigin = '0 0';
                    contentRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
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
                    commitZoom(p.targetZoom, p.anchorDocX, p.anchorDocY, p.currScreenX, p.currScreenY);
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
                    const docX = (el.scrollLeft + fx) / z;
                    const docY = (el.scrollTop + fy) / z;
                    commitZoom(nz, docX, docY, fx, fy);
                    lastTap = null;
                } else {
                    lastTap = { x: tap.x, y: tap.y, t: now };
                }
            }
            tap = null;
        };

        el.addEventListener('touchstart', start, { passive: false });
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

    const clientW = containerSize.width || (typeof window !== 'undefined' ? window.innerWidth : 800);
    const clientH = containerSize.height || (typeof window !== 'undefined' ? window.innerHeight : 600);

    const baseW = clientW < 840 ? clientW : 840;
    const availH = Math.max(220, clientH - topPad - bottomPad);
    const availW = Math.max(280, clientW - (clientW < 640 ? 24 : 48));

    // Approximate page width for horizontal mode container centering
    let estPageW = availW;
    let estPageH = estPageW * 0.707;
    if (estPageH > availH) {
        estPageH = availH;
        estPageW = estPageH / 0.707;
    }
    const estScaledW = Math.round(estPageW * zoom);
    const sidePad = Math.max(16, Math.round((clientW - estScaledW) / 2));

    const cssWidth = Math.round(baseW * zoom);

    return (
        <div
            ref={setScroller}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                inset: 0,
                direction: isLandscape ? 'rtl' : 'ltr',
                overflowX: 'auto',
                overflowY: isLandscape && zoom <= 1.05 ? 'hidden' : 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                scrollSnapType: isLandscape && zoom <= 1.05 ? 'x mandatory' : 'none',
                touchAction: 'pan-x pan-y',
                backgroundColor: colors.canvasBg,
            }}
        >
            {pdf && (
                <div
                    ref={contentRef}
                    style={isLandscape ? {
                        minWidth: '100%',
                        width: 'max-content',
                        height: '100%',
                        paddingTop: topPad,
                        paddingBottom: bottomPad,
                        paddingLeft: sidePad,
                        paddingRight: sidePad,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                        direction: 'rtl',
                        willChange: 'transform',
                    } : {
                        width: cssWidth,
                        margin: '0 auto',
                        paddingTop: topPad,
                        paddingBottom: bottomPad,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        direction: 'ltr',
                        willChange: 'transform',
                    }}
                >
                    {Array.from({ length: pdf.numPages }, (_, i) => (
                        <PdfPage
                            key={i}
                            pdf={pdf}
                            pageNum={i + 1}
                            isLandscape={isLandscape}
                            zoom={zoom}
                            availW={availW}
                            availH={availH}
                            baseW={baseW}
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
    const pdfUrl = propPdfUrl || stateData.pdfUrl || searchParams.get('url') || sessionStorage.getItem('last_pdf_url') || '/uploads/vault/1785056339732-Nexus_Practice_Quiz.pdf';
    const title = propTitle || stateData.title || searchParams.get('title') || sessionStorage.getItem('last_pdf_title') || 'Practice Quiz';
    const date = stateData.date || '';
    const questions = stateData.questions;

    const [isLandscape, setIsLandscape] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [viewerReady, setViewerReady] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);

    useEffect(() => {
        if (stateData.pdfUrl || propPdfUrl || searchParams.get('url')) {
            const u = propPdfUrl || stateData.pdfUrl || searchParams.get('url');
            sessionStorage.setItem('last_pdf_url', u);
            if (title) sessionStorage.setItem('last_pdf_title', title);
        }
    }, [stateData, propPdfUrl, searchParams, title]);

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
                    paddingBottom: isLandscape ? 4 : 8,
                    minHeight: isLandscape ? (TOP_OFFSET + 40) : HEADER_TOTAL_H,
                    background: colors.bar,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'min-height 0.2s ease, padding 0.2s ease',
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
                {!isLandscape && (
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
                )}
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
                            isLandscape={isLandscape}
                            currentPage={currentPage}
                            topPad={isLandscape ? (TOP_OFFSET + 44) : (HEADER_TOTAL_H + 16)}
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

                {/* Floating dock — page number, rotate option */}
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
                        {/* Visual rotate button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLandscape((prev) => !prev);
                                setZoom(1);
                            }}
                            className="h-full px-3.5 flex items-center justify-center transition-all hover:opacity-80 active:scale-95 focus:outline-none"
                            style={{
                                color: isLandscape ? '#3b82f6' : colors.text,
                                borderLeft: `1px solid ${colors.border}`,
                                backgroundColor: isLandscape ? (theme === 'light' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.15)') : 'transparent',
                            }}
                            title={isLandscape ? "Switch to Vertical" : "Switch to Horizontal"}
                            aria-label="Rotate"
                        >
                            <RotateCw
                                size={15}
                                strokeWidth={1.8}
                                style={{
                                    transform: isLandscape ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.25s ease',
                                }}
                            />
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