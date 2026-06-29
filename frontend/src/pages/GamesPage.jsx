import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaTimes, FaPlay, FaPause, FaRedo, FaTrophy, FaStar, FaMedal } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';

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

function SimpleSnakeGame({ onClose }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(localStorage.getItem('snakeHighScore') || 0);

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
    setIsPlaying(true);
    setGameOver(false);
    setSnake([{ x: 10, y: 10 }]);
    setScore(0);
    generateFood();
  };

  const resetGame = () => {
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
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Snake Game</h2>
              <p className="text-gray-400">Classic arcade action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-black rounded-2xl p-6 mb-6 shadow-inner">
              <div
                className="grid gap-0 border-2 border-gray-600 rounded-xl overflow-hidden w-full max-w-[min(100vw-6rem,380px)] aspect-square mx-auto"
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
                    <div
                      key={index}
                      className={`aspect-square border border-gray-800 ${
                        isSnakeHead ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg' :
                        isSnakeBody ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                        isFood ? 'bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse' : 'bg-gray-900'
                      }`}
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
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Score</p>
                <h3 className="text-2xl font-bold text-green-400">{score}</h3>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">High Score</p>
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
                <p className="text-gray-300">Final Score: {score}</p>
              </motion.div>
            )}
          </div>

          <div className="lg:w-80">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                How to Play
              </h3>
              <ul className="text-gray-300 text-sm space-y-3">
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

function SimpleMemoryGame({ onClose }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(localStorage.getItem('memoryBestTime') || null);

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
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Memory Game</h2>
              <p className="text-gray-400">Match all pairs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-2xl text-3xl font-bold transition-all duration-300 shadow-lg ${
                flipped.includes(card.id) || matched.includes(card.id)
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-700 hover:from-gray-600 hover:to-gray-500'
              }`}
              whileHover={{ scale: flipped.includes(card.id) || matched.includes(card.id) ? 1.05 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={matched.includes(card.id)}
            >
              {flipped.includes(card.id) || matched.includes(card.id) ? card.emoji : '?'}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Moves</p>
            <h3 className="text-2xl font-bold text-blue-400">{moves}</h3>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Time</p>
            <h3 className="text-2xl font-bold text-green-400">{formatTime(time)}</h3>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Best Time</p>
            <h3 className="text-2xl font-bold text-yellow-400">{bestTime ? formatTime(bestTime) : '--'}</h3>
          </div>
        </div>

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
            <p className="text-gray-300">Completed in {moves} moves and {formatTime(time)}</p>
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

function WordleGame({ onClose }) {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const words = ['REACT', 'GAMES', 'CODER', 'SMART', 'TASKS', 'BUILD', 'LEARN', 'FUNNY', 'QUICK', 'BRAVE'];

  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleKeyPress = (key) => {
    if (gameOver) return;

    if (key === 'ENTER' && currentGuess.length === 5) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setAttempts(prev => prev + 1);

      if (currentGuess === word) {
        setWon(true);
        setGameOver(true);
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
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Wordle Clone</h2>
              <p className="text-gray-400">Guess the 5-letter word</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
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
                      rowIndex === guesses.length ? 'border-white/50 text-white' : 'border-gray-600'
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
            <p className="text-gray-300">
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

function MathQuizGame({ onClose }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(localStorage.getItem('mathHighScore') || 0);
  const [feedback, setFeedback] = useState('');

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
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('mathHighScore', score);
      }
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft, score, highScore]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Math Quiz</h2>
              <p className="text-gray-400">Solve as many as you can!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {gameActive ? (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-4">{question}</div>
              <div className="text-2xl font-bold text-cyan-400 mb-4">Time: {timeLeft}s</div>
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                className="w-full text-center text-3xl font-bold bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:border-red-400 focus:outline-none"
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
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Score</p>
                <p className="text-2xl font-bold text-red-400">{score}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧮</div>
            <p className="text-gray-300 text-lg mb-6">
              Solve math problems as fast as you can! You have 30 seconds.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Last Score</p>
                <p className="text-2xl font-bold text-red-400">{score}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">High Score</p>
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

function TypingSpeedGame({ onClose }) {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestWpm, setBestWpm] = useState(localStorage.getItem('typingBestWpm') || 0);

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
    return 'text-gray-400';
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
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Typing Speed</h2>
              <p className="text-gray-400">Type as fast as you can!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
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
              className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white font-mono text-lg focus:border-indigo-400 focus:outline-none resize-none"
              placeholder="Start typing here..."
              disabled={!gameStarted && endTime}
            />

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">WPM</p>
                <p className="text-3xl font-bold text-indigo-400">{wpm}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Best WPM</p>
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
                <p className="text-gray-300">
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

function ReactionTimeGame({ onClose }) {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, clicked, result
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(localStorage.getItem('reactionBestTime') || null);
  const [attempts, setAttempts] = useState(0);

  const startGame = () => {
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
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-4 md:p-6 w-full max-w-[min(100vw-2rem,900px)] max-h-[min(100vh-2rem,900px)] overflow-y-auto shadow-2xl"
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
              <h2 className="text-3xl font-bold text-white">Reaction Time</h2>
              <p className="text-gray-400">Test your reflexes!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-all"
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
                : 'bg-gray-500/20 border-4 border-gray-500 text-gray-400'
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Your Time</p>
              <p className="text-2xl font-bold text-cyan-400">{reactionTime}ms</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Best Time</p>
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

  const filteredGames = filter === 'all' ? games : games.filter(game => game.category.toLowerCase() === filter);

  const openGame = (gameId) => {
    setSelectedGame(gameId);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  const categories = ['all', ...new Set(games.map(game => game.category.toLowerCase()))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎮 Game Center
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Challenge yourself with our collection of fun and engaging games!
          </p>
        </motion.div>

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
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-blue-400/40 transition-all cursor-pointer shadow-xl"
              onClick={() => openGame(game.id)}
            >
              <div className="text-4xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
              <p className="text-gray-300 mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                  {game.category}
                </span>
                <span className="text-sm text-gray-400">
                  {game.difficulty}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                className="bg-slate-800 rounded-2xl w-full max-w-[min(100vw-2rem,1024px)] max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedGame === 'snake' && <SimpleSnakeGame onClose={closeGame} />}
                {selectedGame === 'memory' && <SimpleMemoryGame onClose={closeGame} />}
                {selectedGame === 'wordle' && <WordleGame onClose={closeGame} />}
                {selectedGame === 'math' && <MathQuizGame onClose={closeGame} />}
                {selectedGame === 'typing' && <TypingSpeedGame onClose={closeGame} />}
                {selectedGame === 'reaction' && <ReactionTimeGame onClose={closeGame} />}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GamesPage;

