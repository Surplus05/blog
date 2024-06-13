import { type BaseSyntheticEvent, useEffect, useRef } from "react";

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const gradient = useRef<CanvasGradient | null>(null);

  const arr = useRef<Uint8Array>(new Uint8Array(0));

  const isPlaying = useRef<Boolean>(false);

  function renderFrame() {
    if (!contextRef.current || !canvasRef.current) return;

    if (isPlaying.current) requestAnimationFrame(renderFrame);

    analyser.current!.getByteFrequencyData(arr.current);

    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;

    contextRef.current.fillStyle = "rgb(0,0,0,0.05)";
    contextRef.current.fillRect(0, 0, WIDTH, HEIGHT);

    const numBars = arr.current.length;
    const BarWidth = Math.max(Math.round(WIDTH / numBars), 2);

    let drawingPosition = -1 * BarWidth;

    for (let i = 0; drawingPosition < WIDTH; i++) {
      let data = arr.current[i];
      contextRef.current.fillStyle = gradient.current as CanvasGradient;
      contextRef.current.fillRect(
        (drawingPosition += BarWidth + (BarWidth == 1 ? 0 : 1)),
        HEIGHT - (data / 255) * HEIGHT,
        BarWidth,
        (data / 255) * HEIGHT
      );
    }
  }

  function onChangeAudio(e: BaseSyntheticEvent) {
    if (!audioRef.current) return;

    let audio = e.target.files[0];
    if (audio) audioRef.current.src = URL.createObjectURL(audio);
    else return;

    if (!source.current) {
      // Audio Context 생성
      audioContext.current = new AudioContext();

      // Analyser 생성
      analyser.current = audioContext.current.createAnalyser();

      // Analyser 설정
      analyser.current!.fftSize = 512;
      analyser.current!.smoothingTimeConstant = 0.95;
      analyser.current!.minDecibels = -80;

      // 푸리에 변환 데이터 들어갈 배열 초기화
      arr.current = new Uint8Array(analyser.current!.frequencyBinCount);

      // Audio Element와 Audio Context 연결, MediaElementAudioSourceNode 생성
      source.current = audioContext.current.createMediaElementSource(
        audioRef.current
      );

      // Analyser 에 MediaElementAudioSourceNode 연결
      analyser.current!.connect(audioContext.current.destination);

      // MediaElementAudioSourceNode에 Analyser 연결
      source.current.connect(analyser.current!);
    }
  }

  function onPlay() {
    isPlaying.current = true;
    renderFrame();
  }

  function onPause() {
    isPlaying.current = false;
    const WIDTH = canvasRef.current!.width;
    const HEIGHT = canvasRef.current!.height;

    contextRef.current!.fillStyle = "rgba(0,0,0,0)";
    contextRef.current?.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function resizeHandler() {
    if (!canvasRef.current) return;
    const dpr = window.devicePixelRatio;

    const bound = canvasRef.current!.getBoundingClientRect();

    let vw = Number(bound.width.toFixed(1));
    let vh = Number(bound.height.toFixed(1));

    canvasRef.current!.width = vw * dpr;
    canvasRef.current!.height = vh * dpr;
  }

  // init canvas
  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");

      const dpr = window.devicePixelRatio;

      let vw = Number(
        canvasRef.current.getBoundingClientRect().width.toFixed(1)
      );
      let vh = Number(
        canvasRef.current.getBoundingClientRect().height.toFixed(1)
      );

      canvasRef.current.width = vw * dpr;
      canvasRef.current.height = vh * dpr;

      contextRef.current!.imageSmoothingEnabled = true;
      contextRef.current!.imageSmoothingQuality = "high";
      contextRef.current!.lineWidth = 1;
      contextRef.current!.lineCap = "round";
      contextRef.current!.lineJoin = "round";

      gradient.current = contextRef.current?.createLinearGradient(
        0,
        0,
        0,
        255
      ) as CanvasGradient;

      gradient.current.addColorStop(0, "rgb(255,0,0)");
      gradient.current.addColorStop(0.25, "rgb(255,127,0)");
      gradient.current.addColorStop(0.5, "rgb(255,255,0)");
      gradient.current.addColorStop(0.75, "rgb(0,255,0)");

      window.addEventListener("resize", resizeHandler);

      return () => {
        window.removeEventListener("resize", resizeHandler);
      };
    }
  }, []);

  return (
    <>
      <div className="mb-4 flex max-w-full flex-row items-center justify-between">
        <input type="file" onChange={onChangeAudio} accept="audio/*" />
      </div>
      <canvas
        ref={canvasRef}
        id="signature"
        className="h-64 w-full rounded-lg border border-zinc-300 bg-white dark:border-zinc-500"
      >
        지원되지 않는 브라우저 입니다.
      </canvas>

      <audio
        className="mb-6 mt-4 w-full"
        ref={audioRef}
        onPlay={onPlay}
        onPause={onPause}
        controls
      />
      <a
        href="/posts/audio"
        className="mb-6 mt-2 rounded border p-2 font-bold no-underline"
      >
        관련 포스트 보기
      </a>
    </>
  );
}
