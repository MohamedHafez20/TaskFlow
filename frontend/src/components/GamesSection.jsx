import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaTimes, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

const games = [
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Classic snake game - eat food and grow!',
    icon: '🐍',
    difficulty: 'Easy',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'tetris',
    title: 'Tetris Mini',
    description: 'Arrange falling blocks perfectly',
    icon: '🧩',
    difficulty: 'Medium',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Match pairs of cards',
    icon: '🧠',
    difficulty: 'Easy',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'puzzle',
    title: 'Number Puzzle',
    description: 'Arrange numbers 1-15 in order',
    icon: '🔢',
    difficulty: 'Medium',
    color: 'from-orange-500 to-red-500'
  }
];

function SimpleSnakeGame({ onClose }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const gridSize = 20;
  const gameAreaSize = 400;

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
        setScore(prev => prev + 10);
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
  useState(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [direction, gameOver, isPlaying]);

  // Keyboard controls
  useState(() => {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🐍 Snake Game
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-black rounded-lg p-4 mb-4">
              <div
                className="grid gap-0 border-2 border-gray-600"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: gameAreaSize,
                  height: gameAreaSize
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
                      className={`w-5 h-5 border border-gray-800 ${
                        isSnakeHead ? 'bg-green-400' :
                        isSnakeBody ? 'bg-green-600' :
                        isFood ? 'bg-red-500' : 'bg-gray-900'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={startGame}
                disabled={isPlaying}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <FaPlay className="text-sm" />
                {isPlaying ? 'Playing...' : 'Start'}
              </button>
              <button
                onClick={resetGame}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <FaRedo className="text-sm" />
                Reset
              </button>
            </div>

            <div className="text-white text-center">
              <p className="text-lg font-semibold">Score: {score}</p>
              {gameOver && <p className="text-red-400 mt-2">Game Over!</p>}
            </div>
          </div>

          <div className="md:w-64">
            <h3 className="text-white font-semibold mb-3">How to Play</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Use arrow keys to move</li>
              <li>• Eat the red food to grow</li>
              <li>• Avoid hitting walls or yourself</li>
              <li>• Try to get the highest score!</li>
            </ul>
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

  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯'];

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🧠 Memory Game
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2"
          >
            <FaTimes />
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-300">Moves: {moves}</p>
          {isGameComplete && (
            <p className="text-green-400 font-semibold mt-2">
              🎉 Congratulations! Completed in {moves} moves!
            </p>
          )}
        </div>

        {!gameStarted ? (
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-lg text-2xl font-bold transition-all duration-300 ${
                  flipped.includes(card.id) || matched.includes(card.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-700 hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={matched.includes(card.id)}
              >
                {flipped.includes(card.id) || matched.includes(card.id) ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={initializeGame}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            New Game
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GamesSection() {
  const [selectedGame, setSelectedGame] = useState(null);

  const openGame = (gameId) => {
    setSelectedGame(gameId);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaGamepad className="text-purple-400" />
          Quick Games
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <motion.button
              key={game.id}
              onClick={() => openGame(game.id)}
              className={`bg-gradient-to-r ${game.color} p-4 rounded-2xl text-white text-left hover:shadow-lg transition-all`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{game.icon}</span>
                <div>
                  <h3 className="font-semibold">{game.title}</h3>
                  <span className="text-xs opacity-80">{game.difficulty}</span>
                </div>
              </div>
              <p className="text-sm opacity-90">{game.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedGame === 'snake' && <SimpleSnakeGame onClose={closeGame} />}
        {selectedGame === 'memory' && <SimpleMemoryGame onClose={closeGame} />}
        {selectedGame && (selectedGame === 'tetris' || selectedGame === 'puzzle') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeGame}
          >
            <motion.div
              className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                🚧 Coming Soon!
              </h2>
              <p className="text-gray-300 mb-6">
                This game is under development. Check back later!
              </p>
              <button
                onClick={closeGame}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GamesSection;