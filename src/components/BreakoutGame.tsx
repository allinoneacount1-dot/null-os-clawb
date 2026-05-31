import { useEffect, useRef, useState, useCallback } from "react";
import { useSettings } from "../hooks/use-settings";
import { playBeep } from "./SoundManager";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 35;

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
};

export function BreakoutGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings, setSettings } = useSettings();
  const [paddle, setPaddle] = useState({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
  });
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 3,
    dy: -3,
  });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const initBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          w: BRICK_WIDTH,
          h: BRICK_HEIGHT,
          active: true,
        });
      }
    }
    return newBricks;
  }, []);

  const resetGame = useCallback(() => {
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 });
    setBricks(initBricks());
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setStarted(false);
    setIsNewHighScore(false);
  }, [initBricks]);

  const checkHighScore = useCallback((currentScore: number) => {
    if (currentScore > settings.highScores.breakout) {
      setIsNewHighScore(true);
      setSettings(prev => ({
        ...prev,
        highScores: { ...prev.highScores, breakout: currentScore }
      }));
      if (settings.soundEnabled) {
        playBeep(1200, 0.2, "square");
      }
    }
  }, [settings.highScores.breakout, setSettings, settings.soundEnabled]);

  const gameLoop = useCallback(() => {
    setPaddle(prevPaddle => {
      let newX = prevPaddle.x;
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) {
        newX = Math.max(0, prevPaddle.x - 7);
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"]) {
        newX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prevPaddle.x + 7);
      }
      return { ...prevPaddle, x: newX };
    });

    setBall(prevBall => {
      let newX = prevBall.x + prevBall.dx;
      let newY = prevBall.y + prevBall.dy;
      let newDx = prevBall.dx;
      let newDy = prevBall.dy;

      if (newX + BALL_RADIUS > CANVAS_WIDTH || newX - BALL_RADIUS < 0) {
        newDx = -newDx;
        if (settings.soundEnabled) playBeep(600, 0.05, "square");
      }
      if (newY - BALL_RADIUS < 0) {
        newDy = -newDy;
        if (settings.soundEnabled) playBeep(600, 0.05, "square");
      }

      setPaddle(currentPaddle => {
        if (
          newY + BALL_RADIUS > currentPaddle.y &&
          newY - BALL_RADIUS < currentPaddle.y + PADDLE_HEIGHT &&
          newX > currentPaddle.x &&
          newX < currentPaddle.x + PADDLE_WIDTH
        ) {
          newDy = -Math.abs(newDy);
          if (settings.soundEnabled) playBeep(800, 0.05, "square");
        }
        return currentPaddle;
      });

      setBricks(currentBricks => {
        let hitBrick = false;
        const newBricks = currentBricks.map(brick => {
          if (!brick.active) return brick;
          if (
            newX > brick.x &&
            newX < brick.x + brick.w &&
            newY > brick.y &&
            newY < brick.y + brick.h
          ) {
            hitBrick = true;
            setScore(s => s + 10);
            if (settings.soundEnabled) playBeep(1000, 0.05, "square");
            return { ...brick, active: false };
          }
          return brick;
        });
        if (hitBrick) {
          newDy = -newDy;
        }
        const allDestroyed = newBricks.every(b => !b.active);
        if (allDestroyed) {
          setGameWon(true);
          checkHighScore(score + 10);
          if (settings.soundEnabled) playBeep(1200, 0.3, "square");
        }
        return newBricks;
      });

      if (newY + BALL_RADIUS > CANVAS_HEIGHT) {
        setGameOver(true);
        checkHighScore(score);
        if (settings.soundEnabled) playBeep(200, 0.3, "sawtooth");
      }

      return { x: newX, y: newY, dx: newDx, dy: newDy };
    });
  }, [settings.soundEnabled, checkHighScore, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (!started && (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key))) {
        setStarted(true);
      }
      if ((gameOver || gameWon) && e.key === "Enter") {
        resetGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver, gameWon, resetGame, started]);

  useEffect(() => {
    if (started && !gameOver && !gameWon) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [started, gameOver, gameWon, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#C6FF00";
    ctx.shadowColor = "#C6FF00";
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#8B3DFF";
    ctx.shadowColor = "#8B3DFF";
    ctx.fill();

    ctx.shadowBlur = 5;
    bricks.forEach((brick, index) => {
      if (!brick.active) return;
      const hue = (index / (BRICK_ROWS * BRICK_COLS)) * 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    });
    ctx.shadowBlur = 0;
  }, [paddle, ball, bricks]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
      <div className="hud-border p-4 bg-void/90">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span className="text-neon glow-neon">BREAKOUT.EXE v1.0</span>
          <div className="flex gap-4">
            <span className="text-muted-foreground">SCORE: {score}</span>
            <span className="text-purple">HIGH: {settings.highScores.breakout}</span>
          </div>
          <button onClick={onClose} className="text-destructive hover:underline">
            [X] EXIT
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-border block"
        />
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          {!started && !gameOver && !gameWon && "PRESS ANY ARROW KEY TO START"}
          {gameOver && (
            <div>
              <span className="text-destructive block mb-1">GAME OVER</span>
              {isNewHighScore && <span className="text-neon glow-neon block mb-1">NEW HIGH SCORE!</span>}
              <span>PRESS ENTER TO RESTART</span>
            </div>
          )}
          {gameWon && (
            <div>
              <span className="text-neon glow-neon block mb-1">YOU WIN!</span>
              {isNewHighScore && <span className="text-neon glow-neon block mb-1">NEW HIGH SCORE!</span>}
              <span>PRESS ENTER TO PLAY AGAIN</span>
            </div>
          )}
          {started && !gameOver && !gameWon && "USE ARROW KEYS OR A/D TO MOVE"}
        </div>
      </div>
    </div>
  );
}
