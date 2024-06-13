import { useEffect, useRef } from "react";

export class Particle {
  [key: string]: any;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.width = Math.floor(Math.random() * 10) + 10;
    this.height = Math.floor(Math.random() * 10) + 10;
    this.drawingWidth = Math.random() * this.width;

    this.velocity = Math.random() * 2 + 1;
    this.angle = Math.floor(Math.random() * 360);
    this.amplitude = Math.random() * 3;
    this.waveLength = Math.random() / 2;

    this.rotationSpeed = Math.random() * 2 + 2;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.rotation = Math.random() * 360;

    this.isShrinking = true;
    this.d = this.width / 20;

    this.setColor();
  }

  update(width: number, height: number) {
    this.y += this.velocity;

    this.angle += this.waveLength;
    this.x += Math.sin((this.angle * Math.PI) / 180) * this.amplitude;

    this.rotation += this.rotationSpeed * this.rotationDirection;

    if (this.isShrinking) {
      this.drawingWidth -= this.d;

      if (this.drawingWidth < this.width / 10) this.isShrinking = false;
    } else {
      this.drawingWidth += this.d;
      if (this.drawingWidth > this.width) this.isShrinking = true;
    }

    if (this.angle > 360) this.angle = 0;
    if (this.rotation > 360) this.rotation = 0;
    if (this.y > height) this.reset(width, height);
  }

  reset(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = 0;
    this.width = Math.floor(Math.random() * 10) + 10;
    this.height = Math.floor(Math.random() * 10) + 10;
    this.drawingWidth = Math.random() * this.width;

    this.velocity = Math.random() * 2 + 1;
    this.angle = Math.floor(Math.random() * 360);
    this.amplitude = Math.random() * 3;
    this.waveLength = Math.random() / 2;

    this.rotationSpeed = Math.random() * 2 + 2;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.rotation = Math.random() * 360;

    this.isShrinking = true;
    this.d = this.width / 20;

    this.setColor();
  }

  setColor() {
    this.color = `rgb(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    })`;
  }
}

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isShowing = useRef<boolean>(false);

  const particles = useRef<Array<any>>([]);

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
    }

    if (containerRef.current) {
      containerRef.current.classList.add("hidden");
    }
  }, []);

  function makeParticles() {
    if (!canvasRef.current) return;

    particles.current = [];

    for (let i = 0; i < 192; i++) {
      let particle = new Particle(
        canvasRef.current.width,
        canvasRef.current.height
      );
      particles.current.push(particle);
    }
  }

  function renderFrame() {
    if (isShowing.current) requestAnimationFrame(renderFrame);

    const WIDTH = canvasRef.current!.width;
    const HEIGHT = canvasRef.current!.height;

    contextRef.current?.clearRect(0, 0, WIDTH, HEIGHT);

    particles.current.forEach((particle: Particle, index: number) => {
      contextRef.current!.fillStyle = particle.color;

      contextRef.current!.translate(particle.x, particle.y);
      contextRef.current!.rotate((particle.rotation * Math.PI) / 180);

      contextRef.current?.fillRect(
        -(particle.drawingWidth / 2),
        -(particle.height / 2),
        particle.drawingWidth,
        particle.height
      );

      contextRef.current!.setTransform(1, 0, 0, 1, 0, 0);

      particles.current[index].update(WIDTH, HEIGHT);
    });
  }

  const toggle = () => {
    if (!containerRef.current) return;

    isShowing.current = !isShowing.current;
    if (isShowing.current) {
      makeParticles();
      renderFrame();
      containerRef.current.classList.remove("hidden");
    } else {
      containerRef.current.classList.add("hidden");
    }
  };

  return (
    <>
      <button
        className="mb-6 mr-4 mt-2 rounded border px-2 py-1 font-bold"
        onClick={toggle}
      >
        체험 해 보기
      </button>
      <a
        href="/posts/confetti"
        className="mb-6 mt-2 rounded border p-2 font-bold no-underline"
      >
        관련 포스트 보기
      </a>

      <div
        ref={containerRef}
        className="z-9999 fixed left-0 top-0 flex h-full w-full items-center justify-center"
      >
        <canvas
          onClick={toggle}
          ref={canvasRef}
          className="fixed left-0 top-0 z-20 h-full w-full"
        />
      </div>
    </>
  );
}
