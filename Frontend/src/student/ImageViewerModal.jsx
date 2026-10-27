import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import useBackButton from '../hooks/useBackButton';

const STATUS_BAR_H = 28.5;
const HEADER_H = 56;
const TOP_OFFSET = STATUS_BAR_H + 12;
const HEADER_TOTAL_H = TOP_OFFSET + HEADER_H;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

const PALETTE = {
    dark: {
        root: '#0a0a0a',
        canvasBg: '#121212',
        bar: 'rgba(10,10,10,0.85)',
        border: 'rgba(255,255,255,0.10)',
        text: '#fafafa',
        muted: 'rgba(250,250,250,0.55)',
        hover: 'rgba(255,255,255,0.10)',
        pageShadow: '0 4px 24px rgba(0,0,0,0.6)',
    },
    light: {
        root: '#ffffff',
        canvasBg: '#efefef',
        bar: 'rgba(255,255,255,0.88)',
        border: 'rgba(0,0,0,0.10)',
        text: '#0a0a0a',
        muted: 'rgba(10,10,10,0.55)',
        hover: 'rgba(0,0,0,0.06)',
        pageShadow: '0 4px 24px rgba(0,0,0,0.15)',
    },
};

export default function ImageViewerModal({
    src,
    title = 'Image Preview',
    subtitle = 'Notice Graphic',
    onClose,
}) {
    const { theme } = useTheme();
    const colors = theme === 'light' ? PALETTE.light : PALETTE.dark;

    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, offX: 0, offY: 0 });
    const containerRef = useRef(null);

    // Hide bottom nav while viewer is active
    useEffect(() => {
        document.body.setAttribute('data-hide-nav', 'true');
        const prevB = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.removeAttribute('data-hide-nav');
            document.body.style.overflow = prevB;
        };
    }, []);

    useBackButton(() => {
        if (onClose) {
            onClose();
            return true;
        }
        return false;
    });

    // Reset offset when zoom returns to 1
    const resetZoom = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(MAX_ZOOM, Number((prev + 0.5).toFixed(1))));
    };

    const handleZoomOut = () => {
        setZoom(prev => {
            const next = Math.max(MIN_ZOOM, Number((prev - 0.5).toFixed(1)));
            if (next <= 1) setOffset({ x: 0, y: 0 });
            return next;
        });
    };

    // Double tap / double click
    const handleDoubleClick = (e) => {
        if (zoom > 1.1) {
            resetZoom();
        } else {
            setZoom(DOUBLE_TAP_ZOOM);
        }
    };

    // Mouse drag
    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            offX: offset.x,
            offY: offset.y,
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoom <= 1) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setOffset({
            x: dragStartRef.current.offX + dx,
            y: dragStartRef.current.offY + dy,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Mouse wheel zoom
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            setZoom(prev => {
                const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((prev + delta).toFixed(2))));
                if (next <= 1) setOffset({ x: 0, y: 0 });
                return next;
            });
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    // Touch pinch & pan
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let pinchDist = 0;
        let startZoom = 1;
        let touchStart = { x: 0, y: 0, offX: 0, offY: 0 };
        let lastTap = 0;

        const getDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                pinchDist = getDist(e.touches);
                startZoom = zoom;
            } else if (e.touches.length === 1) {
                const now = Date.now();
                if (now - lastTap < 300) {
                    // Double tap
                    if (zoom > 1.1) {
                        resetZoom();
                    } else {
                        setZoom(DOUBLE_TAP_ZOOM);
                    }
                    lastTap = 0;
                    return;
                }
                lastTap = now;

                touchStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    offX: offset.x,
                    offY: offset.y,
                };
            }
        };

        const onTouchMove = (e) => {
            if (e.touches.length === 2 && pinchDist > 0) {
                if (e.cancelable) e.preventDefault();
                const dist = getDist(e.touches);
                const factor = dist / pinchDist;
                const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((startZoom * factor).toFixed(2))));
                setZoom(next);
                if (next <= 1) setOffset({ x: 0, y: 0 });
            } else if (e.touches.length === 1 && zoom > 1) {
                if (e.cancelable) e.preventDefault();
                const dx = e.touches[0].clientX - touchStart.x;
                const dy = e.touches[0].clientY - touchStart.y;
                setOffset({
                    x: touchStart.offX + dx,
                    y: touchStart.offY + dy,
                });
            }
        };

        const onTouchEnd = () => {
            pinchDist = 0;
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [zoom, offset]);

    return (
        <div
            className="fixed inset-0 z-[99999] flex flex-col select-none overflow-hidden"
            style={{
                background: colors.root,
                color: colors.text,
                fontFamily: "'Instrument Sans', system-ui, sans-serif"
            }}
            onMouseUp={handleMouseUp}
        >
            {/* ══ HEADER BAR (Pinned with TOP_OFFSET spacing) ══ */}
            <header
                className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-5"
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
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 focus:outline-none"
                        style={{ color: colors.text }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        aria-label="Back"
                    >
                        <ArrowLeft size={22} strokeWidth={1.8} />
                    </button>
                    <div className="min-w-0 leading-tight">
                        <span className="block text-[15px] font-semibold truncate tracking-tight">
                            {title}
                        </span>
                        {subtitle && (
                            <span className="block text-[12px] opacity-70">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* ══ INTERACTIVE IMAGE CANVAS ══ */}
            <div
                ref={containerRef}
                className="flex-1 w-full relative flex items-center justify-center overflow-hidden"
                style={{
                    background: colors.canvasBg,
                    paddingTop: HEADER_TOTAL_H + 8,
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    touchAction: 'none',
                }}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={src}
                    alt={title}
                    draggable={false}
                    className="max-h-[85vh] max-w-[92vw] object-contain rounded-lg transition-transform duration-75"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        boxShadow: colors.pageShadow,
                        willChange: 'transform',
                    }}
                />
            </div>

            {/* ══ FLOATING DOCK (Zoom controls & percentage badge) ══ */}
            <div
                className="absolute left-1/2 z-40 flex items-center overflow-hidden rounded-full shadow-lg"
                style={{
                    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                    transform: 'translateX(-50%)',
                    height: 42,
                    background: colors.bar,
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: `1px solid ${colors.border}`,
                    boxShadow: colors.pageShadow,
                    fontSize: 13,
                }}
            >
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="w-10 h-full flex items-center justify-center transition-opacity disabled:opacity-30 active:scale-90"
                    style={{ color: colors.text }}
                    title="Zoom Out"
                >
                    <ZoomOut size={16} />
                </button>

                <button
                    onClick={resetZoom}
                    className="px-3 h-full flex items-center gap-1.5 font-semibold text-xs transition-colors hover:opacity-80 active:opacity-60"
                    style={{
                        color: colors.text,
                        borderLeft: `1px solid ${colors.border}`,
                        borderRight: `1px solid ${colors.border}`,
                    }}
                    title="Reset Zoom"
                >
                    <RotateCcw size={12} className="opacity-70" />
                    <span>{Math.round(zoom * 100)}%</span>
                </button>

                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="w-10 h-full flex items-center justify-center transition-opacity disabled:opacity-30 active:scale-90"
                    style={{ color: colors.text }}
                    title="Zoom In"
                >
                    <ZoomIn size={16} />
                </button>
            </div>
        </div>
    );
}
