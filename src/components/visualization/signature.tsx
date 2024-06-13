import { useRef, useEffect, useCallback } from "react";

export default function Signature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");

      const dpr = window.devicePixelRatio;

      let vw = Number(
        canvasRef.current.getBoundingClientRect().width.toFixed(2)
      );
      let vh = Number(
        canvasRef.current.getBoundingClientRect().height.toFixed(2)
      );

      canvasRef.current.width = vw * dpr;
      canvasRef.current.height = vh * dpr;

      contextRef.current?.scale(dpr, dpr);

      contextRef.current!.imageSmoothingEnabled = true;
      contextRef.current!.imageSmoothingQuality = "high";
      contextRef.current!.lineWidth = 3;
      contextRef.current!.lineCap = "round";
      contextRef.current!.lineJoin = "round";

      // mobile
      canvasRef.current.addEventListener("touchmove", touchDrawing);
      canvasRef.current.addEventListener("touchend", () => {
        contextRef.current!.stroke();
        contextRef.current!.beginPath();
      });

      contextRef.current!.beginPath();

      // desktop
      canvasRef.current.addEventListener("mousedown", () => {
        canvasRef.current!.addEventListener("mousemove", mouseDrawing);
      });
      canvasRef.current.addEventListener("mouseup", () => {
        canvasRef.current!.removeEventListener("mousemove", mouseDrawing);
        contextRef.current!.stroke();
        contextRef.current!.beginPath();
      });
      canvasRef.current.addEventListener("mouseleave", () => {
        canvasRef.current!.removeEventListener("mousemove", mouseDrawing);
        contextRef.current!.stroke();
        contextRef.current!.beginPath();
      });
    }
  }, []);

  const mouseDrawing = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      let canvas: DOMRect = canvasRef.current!.getBoundingClientRect();
      contextRef.current!.lineTo(
        e.clientX - canvas.left,
        e.clientY - canvas.top
      );
      contextRef.current!.stroke();
    },
    [contextRef.current, canvasRef.current]
  );

  const touchDrawing = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      let canvas: DOMRect = canvasRef.current!.getBoundingClientRect();

      contextRef.current!.lineTo(
        e.targetTouches[0].clientX - canvas.left,
        e.targetTouches[0].clientY - canvas.top
      );
      contextRef.current!.stroke();
    },
    [contextRef.current, canvasRef.current]
  );

  const clear = useCallback(() => {
    let canvas: DOMRect = canvasRef.current!.getBoundingClientRect();
    contextRef.current?.clearRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef.current, contextRef.current]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="signature"
        className="w-full rounded-lg border border-zinc-300 bg-white dark:border-zinc-500"
      >
        지원되지 않는 브라우저 입니다.
      </canvas>
      <button
        onClick={clear}
        className="mb-6 mr-4 mt-2 rounded border px-2 py-1 font-bold"
      >
        초기화
      </button>
      <a
        href="/posts/signature"
        className="mb-6 mt-2 rounded border p-2 font-bold no-underline"
      >
        관련 포스트 보기
      </a>
    </>
  );
}
