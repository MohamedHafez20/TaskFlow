import { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullseye, FaClock, FaCrown, FaFire, FaTimes, FaPlay, FaRedo, FaTrophy, FaStar, FaMedal } from 'react-icons/fa';
import api from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/Ui/ToastProvider';
import useTaskStore from '../store/useTaskStore';
import useUserStore from '../store/useUserStore';

const BADGE_ICONS = {
  first_task: FaBullseye,
  ten_tasks: FaFire,
  focus_streak: FaClock,
  pomodoro_pro: FaStar,
  level_5: FaCrown,
};

const games = [
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Classic snake game - eat food and grow!',
    icon: '🐍',
    difficulty: 'Easy',
    color: 'from-green-500 to-emerald-500',
    players: '1 Player',
    category: 'Arcade'
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Match pairs of cards',
    icon: '🧠',
    difficulty: 'Easy',
    color: 'from-purple-500 to-pink-500',
    players: '1 Player',
    category: 'Brain'
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    description: 'Test your reflexes',
    icon: '⚡',
    difficulty: 'Easy',
    color: 'from-cyan-500 to-blue-500',
    players: '1 Player',
    category: 'Skill'
  },
  {
    id: 'math',
    title: 'Math Quiz',
    description: 'Solve math problems quickly',
    icon: '🧮',
    difficulty: 'Easy',
    color: 'from-red-500 to-pink-500',
    players: '1 Player',
    category: 'Education'
  },
  {
    id: 'typing',
    title: 'Typing Speed',
    description: 'Type as fast as you can',
    icon: '⌨️',
    difficulty: 'Medium',
    color: 'from-indigo-500 to-purple-500',
    players: '1 Player',
    category: 'Skill'
  },
  {
    id: 'wordle',
    title: 'Wordle Clone',
    description: 'Guess the 5-letter word',
    icon: '📝',
    difficulty: 'Medium',
    color: 'from-yellow-500 to-orange-500',
    players: '1 Player',
    category: 'Word'
  }
];

function SimpleSnakeGame({ onClose, onAward }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(localStorage.getItem('snakeHighScore') || 0);
  const rewardAwardedRef = useRef(false);

  const gridSize = 18;

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    setFood(newFood);
  };

  const moveSnake = () => {
    if (gameOver || !isPlaying) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore);
          }
          return newScore;
        });
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const startGame = () => {
    rewardAwardedRef.current = false;
    setIsPlaying(true);
    setGameOver(false);
    setSnake([{ x: 10, y: 10 }]);
    setScore(0);
    generateFood();
  };

  const resetGame = () => {
    rewardAwardedRef.current = false;
    setIsPlaying(false);
    setGameOver(false);
    setSnake([{ x: 10, y: 10 }]);
    setScore(0);
    setDirection('RIGHT');
  };

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [direction, gameOver, isPlaying, food]);

  useEffect(() => {
    if (!gameOver || rewardAwardedRef.current || score <= 0) return;

    const xpEarned = Math.min(25, Math.floor(score / 10));
    if (xpEarned > 0) {
      rewardAwardedRef.current = true;
      onAward({ gameId: 'snake', score, xpEarned, pointsEarned: 0 });
    }
  }, [gameOver, onAward, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'DOWN') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl">
              🐍
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Snake Game</h2>
              <p className="text-muted">Classic arcade action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-6 mb-6 shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
              <div
                className="grid gap-1 border-2 border-emerald-500/40 rounded-xl overflow-hidden w-full max-w-[min(100vw-6rem,380px)] aspect-square mx-auto bg-gradient-to-br from-slate-950 to-slate-900"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                  const x = index % gridSize;
                  const y = Math.floor(index / gridSize);
                  const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                  const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                  const isFood = food.x === x && food.y === y;

                  return (
                    <motion.div
                      key={index}
                      className={`aspect-square border border-slate-700/30 rounded-sm transition-all ${
                        isSnakeHead ? 'bg-gradient-to-br from-emerald-300 via-emerald-400 to-green-500 shadow-lg shadow-emerald-500/80 scale-100' :
                        isSnakeBody ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/40' :
                        isFood ? 'bg-gradient-to-br from-red-400 to-pink-500 rounded-full shadow-lg shadow-red-500/60 animate-pulse' : 'bg-slate-800/30 hover:bg-slate-700/50'
                      }`}
                      whileTap={{ scale: 0.9 }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={startGame}
                disabled={isPlaying}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <FaPlay />
                {isPlaying ? 'Playing...' : 'Start Game'}
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <FaRedo />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">Score</p>
                <h3 className="text-2xl font-bold text-green-400">{score}</h3>
              </div>
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">High Score</p>
                <h3 className="text-2xl font-bold text-yellow-400">{highScore}</h3>
              </div>
            </div>

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center"
              >
                <h3 className="text-xl font-bold text-red-400 mb-2">Game Over!</h3>
                <p className="text-sub">Final Score: {score}</p>
              </motion.div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="bg-hair backdrop-blur-sm border border-hair rounded-2xl p-6">
              <h3 className="text-ink font-bold mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                How to Play
              </h3>
              <ul className="text-sub text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Use arrow keys to move the snake
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Eat the red food to grow and score points
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Avoid hitting walls or your own tail
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Try to beat your high score!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SimpleMemoryGame({ onClose, onAward }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(localStorage.getItem('memoryBestTime') || null);
  const rewardAwardedRef = useRef(false);

  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯'];

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
    rewardAwardedRef.current = false;
  };

  const handleCardClick = (cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(prev => [...prev, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isGameComplete = matched.length === cards.length && cards.length > 0;

  // Timer
  useEffect(() => {
    let interval;
    if (gameStarted && !isGameComplete) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete]);

  // Check completion
  useEffect(() => {
    if (isGameComplete && (bestTime === null || time < bestTime)) {
      setBestTime(time);
      localStorage.setItem('memoryBestTime', time);
    }
  }, [isGameComplete, time, bestTime]);

  useEffect(() => {
    if (!isGameComplete || rewardAwardedRef.current) return;

    rewardAwardedRef.current = true;
    onAward({
      gameId: 'memory',
      score: Math.max(0, 100 - moves),
      xpEarned: 30,
      pointsEarned: 15,
    });
  }, [isGameComplete, moves, onAward]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
              🧠
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Memory Game</h2>
              <p className="text-muted">Match all pairs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/20"
        >
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-2xl text-4xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden group ${
                flipped.includes(card.id) || matched.includes(card.id)
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105 shadow-2xl shadow-purple-500/50'
                  : 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-600 hover:from-slate-600 hover:to-slate-500 shadow-inner'
              }`}
              whileHover={{ scale: flipped.includes(card.id) || matched.includes(card.id) ? 1.05 : 1.15, rotateZ: 5 }}
              whileTap={{ scale: 0.95 }}
              disabled={matched.includes(card.id)}
            >
              <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: flipped.includes(card.id) || matched.includes(card.id) ? 0 : 180 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="flex items-center justify-center h-full w-full"
              >
                {flipped.includes(card.id) || matched.includes(card.id) ? (
                  <span className="text-5xl drop-shadow-lg">{card.emoji}</span>
                ) : (
                  <span className="text-3xl font-bold text-slate-400">?</span>
                )}
              </motion.div>
              {matched.includes(card.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-30 rounded-2xl"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/40 rounded-xl p-4 text-center shadow-lg"
          >
            <p className="text-muted text-sm mb-1 font-semibold">Moves</p>
            <h3 className="text-3xl font-bold text-purple-300">{moves}</h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/40 rounded-xl p-4 text-center shadow-lg"
          >
            <p className="text-muted text-sm mb-1 font-semibold">Time</p>
            <h3 className="text-3xl font-bold text-cyan-300">{formatTime(time)}</h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-4 text-center shadow-lg"
          >
            <p className="text-muted text-sm mb-1 font-semibold">Best Time</p>
            <h3 className="text-3xl font-bold text-yellow-300">{bestTime ? formatTime(bestTime) : '--'}</h3>
          </motion.div>
        </motion.div>

        {isGameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6 text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaTrophy className="text-yellow-400 text-2xl" />
              <h3 className="text-2xl font-bold text-green-400">Congratulations!</h3>
            </div>
            <p className="text-sub">Completed in {moves} moves and {formatTime(time)}</p>
            {bestTime === time && <p className="text-yellow-400 font-semibold mt-2">New Best Time! 🏆</p>}
          </motion.div>
        )}

        <div className="flex gap-3">
          {!gameStarted ? (
            <button
              onClick={initializeGame}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
            >
              Start Game
            </button>
          ) : (
            <button
              onClick={initializeGame}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
            >
              New Game
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WordleGame({ onClose, onAward }) {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const rewardAwardedRef = useRef(false);

  const words = ['REACT', 'GAMES', 'CODER', 'SMART', 'TASKS', 'BUILD', 'LEARN', 'FUNNY', 'QUICK', 'BRAVE'];

  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleKeyPress = (key) => {
    if (gameOver) return;

    if (key === 'ENTER' && currentGuess.length === 5) {
      const newGuesses = [...guesses, currentGuess];
      const nextAttempts = attempts + 1;
      setGuesses(newGuesses);
      setAttempts(nextAttempts);

      if (currentGuess === word) {
        setWon(true);
        setGameOver(true);
        if (!rewardAwardedRef.current) {
          rewardAwardedRef.current = true;
          onAward({
            gameId: 'wordle',
            score: Math.max(0, 7 - nextAttempts) * 10,
            xpEarned: 40,
            pointsEarned: 20,
          });
        }
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
      }

      setCurrentGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && key.length === 1 && key.match(/[A-Z]/)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const getLetterStatus = (letter, index, guess) => {
    if (word[index] === letter) return 'correct';
    if (word.includes(letter)) return 'present';
    return 'absent';
  };

  const resetGame = () => {
    rewardAwardedRef.current = false;
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setAttempts(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Wordle Clone</h2>
              <p className="text-muted">Guess the 5-letter word</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const guess = guesses[rowIndex];
                const letter = guess ? guess[colIndex] : (rowIndex === guesses.length ? currentGuess[colIndex] : '');
                const status = guess ? getLetterStatus(letter, colIndex, guess) : '';

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                      status === 'correct' ? 'bg-green-500 border-green-500 text-white' :
                      status === 'present' ? 'bg-yellow-500 border-yellow-500 text-white' :
                      status === 'absent' ? 'bg-gray-500 border-gray-500 text-white' :
                      rowIndex === guesses.length ? 'border-hair text-ink' : 'border-gray-600'
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 text-center mb-6 ${
              won ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
            }`}
          >
            <h3 className={`text-2xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? '🎉 Congratulations!' : '😞 Game Over'}
            </h3>
            <p className="text-sub">
              {won ? `You guessed it in ${attempts} attempts!` : `The word was: ${word}`}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-10 gap-1 mb-6">
          {'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map((letter) => (
            <button
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded font-semibold transition-colors"
            >
              {letter}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress('ENTER')}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-semibold transition-colors col-span-2"
          >
            Enter
          </button>
          <button
            onClick={() => handleKeyPress('BACKSPACE')}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded font-semibold transition-colors col-span-2"
          >
            ⌫
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetGame}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            New Game
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MathQuizGame({ onClose, onAward }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(localStorage.getItem('mathHighScore') || 0);
  const [feedback, setFeedback] = useState('');
  const rewardAwardedRef = useRef(false);

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, result;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        result = num1 + num2;
        setQuestion(`${num1} + ${num2} = ?`);
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        result = num1 - num2;
        setQuestion(`${num1} - ${num2} = ?`);
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        result = num1 * num2;
        setQuestion(`${num1} × ${num2} = ?`);
        break;
    }
    setCorrectAnswer(result);
  };

  const startGame = () => {
    rewardAwardedRef.current = false;
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setFeedback('');
    generateQuestion();
  };

  const submitAnswer = () => {
    const userAnswer = parseInt(answer);
    if (userAnswer === correctAnswer) {
      setScore(prev => prev + 10);
      setFeedback('✅ Correct!');
      setTimeout(() => {
        generateQuestion();
        setAnswer('');
        setFeedback('');
      }, 1000);
    } else {
      setFeedback(`❌ Wrong! Answer: ${correctAnswer}`);
      setTimeout(() => {
        generateQuestion();
        setAnswer('');
        setFeedback('');
      }, 2000);
    }
  };

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      if (!rewardAwardedRef.current) {
        const correctAnswers = Math.floor(score / 10);
        const xpEarned = Math.min(30, correctAnswers * 5);
        rewardAwardedRef.current = true;
        if (xpEarned > 0) {
          onAward({ gameId: 'math', score, xpEarned, pointsEarned: 0 });
        }
      }
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('mathHighScore', score);
      }
    }
    return () => clearTimeout(timer);
  }, [gameActive, highScore, onAward, score, timeLeft]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
              🧮
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Math Quiz</h2>
              <p className="text-muted">Solve as many as you can!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {gameActive ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-ink mb-4">{question}</div>
              <div className="text-2xl font-bold text-[var(--c-accent)] mb-4">Time: {timeLeft}s</div>
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                className="w-full text-center text-3xl font-bold bg-hair border border-hair rounded-xl p-4 text-ink focus:border-red-400 focus:outline-none"
                placeholder="Your answer..."
                autoFocus
              />
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 text-xl font-bold ${feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}
                >
                  {feedback}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">Score</p>
                <p className="text-2xl font-bold text-red-400">{score}</p>
              </div>
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧮</div>
            <p className="text-sub text-lg mb-6">
              Solve math problems as fast as you can! You have 30 seconds.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">Last Score</p>
                <p className="text-2xl font-bold text-red-400">{score}</p>
              </div>
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!gameActive ? (
            <button
              onClick={startGame}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
            >
              Start Quiz
            </button>
          ) : (
            <button
              onClick={submitAnswer}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
            >
              Submit Answer
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TypingSpeedGame({ onClose, onAward }) {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestWpm, setBestWpm] = useState(localStorage.getItem('typingBestWpm') || 0);
  const rewardAwardedRef = useRef(false);

  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower."
  ];

  const startGame = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setUserInput('');
    setStartTime(Date.now());
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setGameStarted(true);
    rewardAwardedRef.current = false;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Calculate WPM
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wordsTyped = value.length / 5; // average word length
    const currentWpm = Math.round(wordsTyped / timeElapsed);
    setWpm(currentWpm);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) correctChars++;
    }
    const currentAccuracy = Math.round((correctChars / value.length) * 100);
    setAccuracy(currentAccuracy);

    // Check if finished
    if (value.length === text.length) {
      setEndTime(Date.now());
      setGameStarted(false);
      if (!rewardAwardedRef.current) {
        rewardAwardedRef.current = true;
        onAward({ gameId: 'typing', score: currentWpm, xpEarned: 25, pointsEarned: 0 });
      }

      if (currentWpm > bestWpm) {
        setBestWpm(currentWpm);
        localStorage.setItem('typingBestWpm', currentWpm);
      }
    }
  };

  const getCharClass = (char, index) => {
    if (index < userInput.length) {
      return userInput[index] === char ? 'text-green-400' : 'text-red-400 bg-red-500/20';
    }
    return 'text-muted';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl">
              ⌨️
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Typing Speed</h2>
              <p className="text-muted">Type as fast as you can!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {!gameStarted && !text && (
          <div className="text-center mb-8">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-semibold text-xl transition-all shadow-lg"
            >
              Start Typing Test
            </button>
          </div>
        )}

        {text && (
          <>
            <div className="bg-black/50 rounded-2xl p-6 mb-6 font-mono text-lg leading-relaxed">
              {text.split('').map((char, index) => (
                <span key={index} className={getCharClass(char, index)}>
                  {char}
                </span>
              ))}
            </div>

            <textarea
              value={userInput}
              onChange={handleInputChange}
              className="w-full h-32 bg-hair border border-hair rounded-xl p-4 text-ink font-mono text-lg focus:border-indigo-400 focus:outline-none resize-none"
              placeholder="Start typing here..."
              disabled={!gameStarted && endTime}
            />

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">WPM</p>
                <p className="text-3xl font-bold text-indigo-400">{wpm}</p>
              </div>
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              </div>
              <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
                <p className="text-muted text-sm mb-1">Best WPM</p>
                <p className="text-3xl font-bold text-yellow-400">{bestWpm}</p>
              </div>
            </div>

            {endTime && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-6 text-center"
              >
                <h3 className="text-2xl font-bold text-green-400 mb-2">Test Complete!</h3>
                <p className="text-sub">
                  You typed at {wpm} WPM with {accuracy}% accuracy
                  {wpm === bestWpm && wpm > 0 && " - New Personal Best! 🏆"}
                </p>
              </motion.div>
            )}
          </>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={startGame}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            New Test
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReactionTimeGame({ onClose, onAward }) {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, clicked, result
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(localStorage.getItem('reactionBestTime') || null);
  const [attempts, setAttempts] = useState(0);
  const rewardAwardedRef = useRef(false);

  const startGame = () => {
    rewardAwardedRef.current = false;
    setGameState('waiting');
    setReactionTime(0);
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early!
      setGameState('result');
      setReactionTime(-1);
    } else if (gameState === 'ready') {
      // Perfect timing!
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts(prev => prev + 1);

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('reactionBestTime', time);
      }

      if (time < 300 && !rewardAwardedRef.current) {
        rewardAwardedRef.current = true;
        onAward({ gameId: 'reaction', score: 300 - time, xpEarned: 20, pointsEarned: 0 });
      }

      setGameState('result');
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-card2 to-card border border-hair rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink">Reaction Time</h2>
              <p className="text-muted">Test your reflexes!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-3 hover:bg-hair rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="text-center mb-8">
          <motion.div
            className={`w-full h-64 rounded-2xl flex items-center justify-center text-6xl font-bold cursor-pointer transition-all duration-200 ${
              gameState === 'waiting'
                ? 'bg-red-500/20 border-4 border-red-500 text-red-400'
                : gameState === 'ready'
                ? 'bg-green-500/20 border-4 border-green-500 text-green-400 animate-pulse'
                : 'bg-gray-500/20 border-4 border-gray-500 text-muted'
            }`}
            onClick={handleClick}
            whileHover={{ scale: gameState === 'ready' ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            {gameState === 'waiting' && 'Wait for green...'}
            {gameState === 'ready' && 'CLICK NOW!'}
            {gameState === 'result' && reactionTime === -1 && 'Too early! Try again'}
            {gameState === 'result' && reactionTime > 0 && `${reactionTime}ms`}
          </motion.div>
        </div>

        {reactionTime > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
              <p className="text-muted text-sm mb-1">Your Time</p>
              <p className="text-2xl font-bold text-[var(--c-accent)]">{reactionTime}ms</p>
            </div>
            <div className="bg-hair backdrop-blur-sm border border-hair rounded-xl p-4 text-center">
              <p className="text-muted text-sm mb-1">Best Time</p>
              <p className="text-2xl font-bold text-yellow-400">{bestTime ? `${bestTime}ms` : '--'}</p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3">
          <button
            onClick={startGame}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            {gameState === 'waiting' ? 'Start Test' : 'Try Again'}
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GamesPage() {
  usePageTitle('Games');

  const [selectedGame, setSelectedGame] = useState(null);
  const [filter, setFilter] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [showLeaderboardDetails, setShowLeaderboardDetails] = useState(false);
  const { showToast } = useToast();
  const gamificationStats = useTaskStore((s) => s.gamificationStats);
  const fetchGamificationStats = useTaskStore((s) => s.fetchGamificationStats);
  const awardGameScore = useTaskStore((s) => s.awardGameScore);
  const userEmail = useUserStore((s) => s.userEmail);
  const userName = useUserStore((s) => s.userName);

  const filteredGames = filter === 'all' ? games : games.filter(game => game.category.toLowerCase() === filter);
  const xpInLevel = gamificationStats?.xpInCurrentLevel ?? 0;
  const xpToNext = gamificationStats?.xpToNextLevel ?? 1000;
  const xpTotal = xpInLevel + xpToNext;
  const xpPercent = xpTotal > 0 ? Math.min(100, Math.round((xpInLevel / xpTotal) * 100)) : 0;

  // Find current user in leaderboard and filter them out
  const currentUserInLeaderboard = leaderboard.find(user => user.email === userEmail || user.name === userName);
  const otherUsers = leaderboard.filter(user => user.email !== userEmail && user.name !== userName);
  const currentUserRank = leaderboard.findIndex(user => user.email === userEmail || user.name === userName) + 1;

  const leaderboardPerPage = 5;
  const totalLeaderboardPages = Math.max(1, Math.ceil(otherUsers.length / leaderboardPerPage));
  const paginatedLeaderboard = otherUsers.slice((leaderboardPage - 1) * leaderboardPerPage, leaderboardPage * leaderboardPerPage);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const { data } = await api.get('/gamification/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load leaderboard', 'error');
    } finally {
      setLeaderboardLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGamificationStats();
    fetchLeaderboard();
  }, [fetchGamificationStats, fetchLeaderboard]);

  useEffect(() => {
    setLeaderboardPage(1);
  }, [leaderboard.length]);

  const handleAward = useCallback(async ({ gameId, score, xpEarned, pointsEarned }) => {
    if (xpEarned <= 0 && pointsEarned <= 0) return;

    const result = await awardGameScore({ gameId, score, xpEarned, pointsEarned });
    if (result.success) {
      const rewardText = [
        xpEarned > 0 ? `${xpEarned} XP` : null,
        pointsEarned > 0 ? `${pointsEarned} points` : null,
      ].filter(Boolean).join(' and ');

      showToast(`Game reward earned: ${rewardText}`, 'success');
      fetchLeaderboard();
    } else {
      showToast(result.message, 'error');
    }
  }, [awardGameScore, fetchLeaderboard, showToast]);

  const openGame = (gameId) => {
    setSelectedGame(gameId);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  const categories = ['all', ...new Set(games.map(game => game.category.toLowerCase()))];

  return (
    <div className="bg-transparent p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-ink mb-3">
            🎮 Game Center
          </h1>
    
          <div className="rounded-2xl border border-hair bg-hair px-5 py-4 text-right backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total Points</p>
            <p className="text-3xl font-bold text-yellow-300">{gamificationStats?.points ?? 0}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <main className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-hair bg-hair p-5 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-muted">Current Level</p>
                  <h2 className="text-3xl font-bold text-ink">
                    Level {gamificationStats?.level ?? 1}
                    <span className="ml-3 text-lg text-[var(--c-accent)]">{gamificationStats?.levelName ?? 'Beginner'}</span>
                  </h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted">{xpInLevel} XP this level</p>
                  <p className="text-sm text-sub">{xpToNext} XP to next level</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-300"
                />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-hair bg-hair p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">Badges</h2>
                <span className="text-sm text-muted">{gamificationStats?.badges?.length ?? 0} unlocked</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {(gamificationStats?.allBadges ?? []).map((badge) => {
                  const earned = badge.earned || gamificationStats?.badges?.includes(badge.id);
                  const BadgeIcon = BADGE_ICONS[badge.id] || FaStar;

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border p-4 text-center transition-all ${
                        earned
                          ? 'border-yellow-300/40 bg-yellow-300/10 text-white'
                          : 'border-hair bg-black/20 text-muted'
                      }`}
                    >
                      <BadgeIcon className="mx-auto mb-3 text-2xl" />
                      <p className="text-sm font-semibold">{badge.label || badge.name}</p>
                      <p className="mt-1 text-xs text-muted">{badge.points} pts</p>
                    </div>
                  );
                })}
                {!gamificationStats?.allBadges?.length && (
                  <p className="col-span-full text-sm text-muted">Badges will appear after stats load.</p>
                )}
              </div>
            </motion.section>

            <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === category
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-hair text-sub hover:bg-hair'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 transition-all cursor-pointer shadow-md hover:shadow-lg relative overflow-hidden group"
              onClick={() => openGame(game.id)}
            >
              <div className="relative z-10">
                <div className="text-5xl mb-3">{game.icon}</div>
                <h3 className="text-lg font-bold text-ink mb-2">{game.title}</h3>
                <p className="text-muted text-sm mb-4 leading-relaxed">{game.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted bg-hair/60 px-2.5 py-1 rounded-full">
                    {game.category}
                  </span>
                  <span className="text-xs font-semibold text-muted bg-hair/60 px-2.5 py-1 rounded-full">
                    {game.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

          </main>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-fit rounded-2xl border border-hair bg-hair/70 p-5 backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">🏆 Leaderboard</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLeaderboardDetails(!showLeaderboardDetails)}
                className="bg-hair/80 hover:bg-hair border border-hair/80 hover:border-hair rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-all"
              >
                {showLeaderboardDetails ? 'Hide All' : 'Show All'}
              </motion.button>
            </div>

            {/* Current User Section */}
            {!leaderboardLoading && currentUserInLeaderboard && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-hair/80 bg-card/80 p-3"
              >
                <p className="text-xs uppercase tracking-widest text-muted mb-2 font-semibold">Your Rank</p>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500/30 text-sm font-bold text-yellow-300 border border-yellow-500/50">
                    <FaMedal />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{currentUserInLeaderboard.name}</p>
                    <p className="text-xs text-muted">Lv {currentUserInLeaderboard.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-300">{currentUserInLeaderboard.points}</p>
                    <p className="text-xs text-muted">#{currentUserRank}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaderboard Details - Toggle */}
            <AnimatePresence>
              {showLeaderboardDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 border-t border-hair/60 pt-3"
                >
                  {leaderboardLoading && <p className="text-sm text-muted">Loading standings...</p>}
                  {!leaderboardLoading && leaderboard.map((user, index) => {
                    const actualRank = index + 1;
                    const isCurrentUser = user.email === userEmail || user.name === userName;
                    return (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                          isCurrentUser ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-black/20 hover:bg-black/30'
                        }`}
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          actualRank === 1 ? 'bg-yellow-400 text-slate-950' :
                          actualRank === 2 ? 'bg-slate-300 text-slate-950' :
                          actualRank === 3 ? 'bg-amber-600 text-white' :
                          'bg-hair text-sub'
                        }`}>
                          {actualRank}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">{user.name}</p>
                        </div>
                        <p className="text-xs font-bold text-sub">{user.points}</p>
                      </motion.div>
                    );
                  })}
                  {!leaderboardLoading && leaderboard.length === 0 && (
                    <p className="text-sm text-muted">No players yet.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>

        <AnimatePresence>
          {selectedGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 pt-8"
              onClick={closeGame}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card2 rounded-2xl w-full max-w-[min(100vw-2rem,1024px)] max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedGame === 'snake' && <SimpleSnakeGame onClose={closeGame} onAward={handleAward} />}
                {selectedGame === 'memory' && <SimpleMemoryGame onClose={closeGame} onAward={handleAward} />}
                {selectedGame === 'wordle' && <WordleGame onClose={closeGame} onAward={handleAward} />}
                {selectedGame === 'math' && <MathQuizGame onClose={closeGame} onAward={handleAward} />}
                {selectedGame === 'typing' && <TypingSpeedGame onClose={closeGame} onAward={handleAward} />}
                {selectedGame === 'reaction' && <ReactionTimeGame onClose={closeGame} onAward={handleAward} />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GamesPage;

