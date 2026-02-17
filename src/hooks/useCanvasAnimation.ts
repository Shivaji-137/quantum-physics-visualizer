/**
 * Custom React Hook for Canvas Animation
 * Handles requestAnimationFrame loop with cleanup
 */

import { useRef, useEffect, useCallback } from 'react';

interface UseCanvasAnimationOptions {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, frameCount: number, deltaTime: number) => void;
  isAnimating?: boolean;
}

export function useCanvasAnimation({
  width,
  height,
  draw,
  isAnimating = true
}: UseCanvasAnimationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationIdRef = useRef<number | undefined>(undefined);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    return ctx;
  }, [width, height]);

  useEffect(() => {
    const ctx = setupCanvas();
    if (!ctx) return;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      frameCountRef.current++;

      draw(ctx, frameCountRef.current, deltaTime);

      if (isAnimating) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    if (isAnimating) {
      animationIdRef.current = requestAnimationFrame(animate);
    } else {
      // Draw single frame when not animating
      draw(ctx, 0, 0);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [draw, isAnimating, setupCanvas]);

  // Redraw on resize
  useEffect(() => {
    const ctx = setupCanvas();
    if (ctx && !isAnimating) {
      draw(ctx, 0, 0);
    }
  }, [width, height, draw, isAnimating, setupCanvas]);

  return canvasRef;
}

/**
 * Hook for managing animation state
 */
export function useAnimationTime(isRunning: boolean = true) {
  const timeRef = useRef(0);
  const lastFrameRef = useRef(performance.now());

  useEffect(() => {
    if (!isRunning) return;

    let animationId: number;

    const tick = () => {
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;
      timeRef.current += delta;
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isRunning]);

  return timeRef;
}
