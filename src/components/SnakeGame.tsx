import { useEffect, useRef, useState, useCallback } from "react";
import { useSettings } from "../hooks/use-settings";
import { playBeep } from "./SoundManager";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

export function SnakeGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings, setSettings } = useSettings();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: typeof INITIAL_SNAKE) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setStarted(false);
    setIsNewHighScore(false);
  }, [generateFood]);

  const checkHighScore = useCallback((currentScore: number) => {
    if (currentScore > settings.highScores.snake) {
      setIsNewHighScore(true);
      setSettings(prev => ({
        ...prev,
        highScores: { ...prev.highScores, snake: currentScore }
      }));
      if (settings.soundEnabled) {
        playBeep(1200, 0.2, "square");
      }
    }
  }, [settings.highScores.snake, setSettings, settings.soundEnabled]);

  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + nextDirection.x,
        y: head.y + nextDirection.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        checkHighScore(score);
        if (settings.soundEnabled) {
          playBeep(200, 0.3, "sawtooth");
        }
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameOver(true);
        checkHighScore(score);
        if (settings.soundEnabled) {
          playBeep(200, 0.3, "sawtooth");
        }
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        if (settings.soundEnabled) {
          playBeep(1000, 0.1, "square");
        }
      } else {
        newSnake.pop();
      }

      setDirection(nextDirection);
      return newSnake;
    });
  }, [nextDirection, food, generateFood, settings.soundEnabled, checkHighScore, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started && (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key))) {
        setStarted(true);
      }

      if (gameOver && e.key === "Enter") {
        resetGame();
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver, resetGame, started]);

  useEffect(() => {
    if (started && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [started, gameOver, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = "rgba(198, 255, 0, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#ff4757";
    ctx.shadowColor = "#ff4757";
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = "#C6FF00";
        ctx.shadowColor = "#C6FF00";
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = `rgba(198, 255, 0, ${1 - index * 0.05})`;
        ctx.shadowBlur = 5;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
      <div className="hud-border p-4 bg-void/90">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span className="text-neon glow-neon">SNAKE.EXE v1.0</span>
          <div className="flex gap-4">
            <span className="text-muted-foreground">SCORE: {score}</span>
            <span className="text-purple">HIGH: {settings.highScores.snake}</span>
          </div>
          <button onClick={onClose} className="text-destructive hover:underline">
            [X] EXIT
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-border block"
        />
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          {!started && !gameOver && "PRESS ANY ARROW KEY TO START"}
          {gameOver && (
            <div>
              <span className="text-destructive block mb-1">GAME OVER</span>
              {isNewHighScore && <span className="text-neon glow-neon block mb-1">NEW HIGH SCORE!</span>}
              <span>PRESS ENTER TO RESTART</span>
            </div>
          )}
          {started && !gameOver && "USE ARROW KEYS OR WASD TO MOVE"}
        </div>
      </div>
    </div>
  );
}
