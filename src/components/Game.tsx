import { useState, useRef, useEffect } from 'react';
import { Chess, type Chess as ChessType } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { quizQuestions, type QuizQuestion } from '../data/quizQuestions';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { calculateScore } from '../utils/scoring';
import { shuffle } from 'lodash';

type GameState = {
  currentQuestion: QuizQuestion;
  remainingQuestions: QuizQuestion[];
  usedQuestions: QuizQuestion[];
  isQuizVisible: boolean;
  lastMoveCorrect: boolean | null;
  currentTaunt: string;
  isGameOver: boolean;
  playerCanMove: boolean;
};

function Game() {
  const navigate = useNavigate();
  const [game] = useState<ChessType>(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionsResetCount, setQuestionsResetCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  
  // Initialize game state with shuffled questions
  const [gameState, setGameState] = useState<GameState>(() => {
    const shuffledQuestions = shuffle([...quizQuestions]);
    return {
      currentQuestion: shuffledQuestions[0],
      remainingQuestions: shuffledQuestions.slice(1),
      usedQuestions: [],
      isQuizVisible: true, // Start with quiz visible
      lastMoveCorrect: null,
      currentTaunt: "Welcome to Planetary Chess! Answer the quiz question to determine Stewie's first move. Correct answers make him weaker in the battle against systemic racism!",
      isGameOver: false,
      playerCanMove: false, // Player cannot move until they answer a question and AI moves
    };
  });

  const stockfishRef = useRef<Worker | null>(null);
  const stockfishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get next question and handle reshuffling when all questions are used
  const getNextQuestion = (): [QuizQuestion, QuizQuestion[], QuizQuestion[]] => {
    // Check if we need to reshuffle (all questions used)
    const needReshuffle = gameState.remainingQuestions.length === 0;

    // Increment reset count if reshuffling
    if (needReshuffle) {
      setQuestionsResetCount(prev => prev + 1);
      console.log("DEBUG: Reshuffling questions, incrementing reset count.");
    }

    const questionsToShuffle = needReshuffle ? [...gameState.usedQuestions] : [...gameState.remainingQuestions];
    const shuffled = shuffle(questionsToShuffle);

    const nextQuestion = shuffled[0];
    const nextRemaining = shuffled.slice(1);
    // If we reshuffled, usedQuestions starts fresh (excluding the new current one)
    // Otherwise, add the current question to usedQuestions
    const nextUsed = needReshuffle ? [] : [...gameState.usedQuestions, gameState.currentQuestion];

    return [nextQuestion, nextRemaining, nextUsed];
  };

  // --- Centralized Game Status Check ---
  const checkGameStatusAndUpdateState = async () => {
    console.log(`DEBUG: Checking game status. isGameOver: ${game.isGameOver()}, isCheckmate: ${game.isCheckmate()}, turn: ${game.turn()}`);

    if (game.isCheckmate()) {
      // Corrected logic based on logs: turn() indicates the player who CANNOT move.
      const playerWon = game.turn() === 'w'; // White (Systemic Racism) cannot move => Player Won
      const aiWon = game.turn() === 'b';    // Black (Player) cannot move => AI Won

      if (playerWon) {
        // --- PLAYER WIN CONDITION ---
        console.log("Player win condition met!");
        const moves = game.history().length;
        // Pass the reset count to the scoring function
        const score = calculateScore(correctAnswersCount, incorrectAnswersCount, Math.ceil(moves / 2), questionsResetCount);
        // Update log to include reset count
        console.log(`Calculated Score: ${score}, Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}, Moves: ${Math.ceil(moves / 2)}, Resets: ${questionsResetCount}`);

        setGameState(prev => ({ ...prev, isGameOver: true, isQuizVisible: false, playerCanMove: false })); // Mark game over immediately

        // Handle leaderboard logic (async)
        try {
          console.log("Fetching leaderboard...");
          const { data: leaderboard, error: fetchError } = await supabase
            .from('scores')
            .select('score')
            .order('score', { ascending: false })
            .limit(10);

          if (fetchError) throw fetchError;
          console.log("Leaderboard data:", leaderboard);

          const qualifies = !leaderboard || leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score;
          console.log(`Qualifies for leaderboard: ${qualifies}`);

          if (qualifies) {
            console.log("Prompting for name...");
            const playerName = window.prompt(`You have ranked on the Planetary Chess leaderboard with a score of ${score}! What's your handle?`);
            console.log(`Player entered name: ${playerName}`);

            if (playerName && playerName.trim() !== '') {
              console.log("Saving score to Supabase...");
              const { error: insertError } = await supabase
                .from('scores')
                .insert([{ name: playerName.trim(), score: score }]);

              if (insertError) throw insertError;

              console.log("Score saved successfully.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! You've successfully resisted systemic oppression! Score: ${score}. Saved to leaderboard as ${playerName.trim()}!` }));
            } else {
              console.log("Player cancelled or entered empty name.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! You've successfully resisted systemic oppression! Score: ${score}. You qualified but didn't enter a name.` }));
            }
          } else {
            setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! You've successfully resisted systemic oppression! Your score: ${score}. Not quite enough for the leaderboard this time.` }));
          }
        } catch (err) {
          console.error("Error handling win condition:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! You've successfully resisted systemic oppression! Score: ${score}. An error occurred processing the leaderboard: ${errorMessage}` }));
        }
        return true; // Game ended

      } else if (aiWon) {
        // --- AI WIN CONDITION ---
        console.log("AI win condition met.");
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          isQuizVisible: false,
          playerCanMove: false,
          currentTaunt: "Hah! Checkmated by Stewie, the embodiment of systemic racism! How delightfully pathetic! Your intellectual genealogy is as shallow as a colonial water basin. But remember, the struggle continues!"
        }));
        return true; // Game ended
      }
    } else if (game.isDraw()) {
      console.log("Draw condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        playerCanMove: false,
        currentTaunt: "A draw? How dreadfully bourgeois. Like watching American Idol without the satisfaction of seeing dreams crushed. The fight against systemic racism continues..."
      }));
      return true; // Game ended
    } else if (game.isStalemate()) {
      console.log("Stalemate condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        playerCanMove: false,
        currentTaunt: "Stalemate? How pedestrian. Like a Walmart shopper trying to haggle. But the struggle against systemic oppression continues!"
      }));
      return true; // Game ended
    } else if (game.isInsufficientMaterial()) {
       console.log("Insufficient material condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        playerCanMove: false,
        currentTaunt: "Insufficient material? A pathetic end. Like bringing a spork to a laser gun fight. But remember, knowledge is your most powerful weapon!"
      }));
      return true; // Game ended
    } else if (game.isThreefoldRepetition()) {
       console.log("Threefold repetition condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        playerCanMove: false,
        currentTaunt: "Threefold repetition? Are you stuck in a temporal loop, you simpleton? Break the cycle of oppression with knowledge!"
      }));
      return true; // Game ended
    }

    // --- Game Continues ---
    console.log("Game continues.");
    return false; // Game did not end
  };
  // --- End Centralized Game Status Check ---

  // Improved Stockfish initialization with error handling
  useEffect(() => {
    // Initialize Stockfish
    try {
      console.log('Initializing Stockfish...');
      
      // Clear any existing timeout
      if (stockfishTimeoutRef.current) {
        clearTimeout(stockfishTimeoutRef.current);
      }
      
      // Create a timeout for Stockfish initialization
      stockfishTimeoutRef.current = setTimeout(() => {
        console.error('Stockfish initialization timeout');
        setGameState(prev => ({
          ...prev,
          currentTaunt: "Error: AI initialization timed out. Please reload the page to try again."
        }));
        setIsThinking(false);
      }, 10000); // 10 second timeout
      
      // Initialize Stockfish worker with proper path for Vite
      stockfishRef.current = new Worker('/stockfish.js');
      stockfishRef.current.addEventListener('message', handleStockfishMessage);
      stockfishRef.current.postMessage('uci');
      stockfishRef.current.postMessage('ucinewgame');
      
      // Listen for initialization confirmation
      const initHandler = (e: MessageEvent) => {
        const message = e.data;
        if (message === 'uciok') {
          console.log('Stockfish initialized successfully');
          // Clear the timeout since initialization succeeded
          if (stockfishTimeoutRef.current) {
            clearTimeout(stockfishTimeoutRef.current);
            stockfishTimeoutRef.current = null;
          }
          
          // Remove this listener
          stockfishRef.current?.removeEventListener('message', initHandler);
          
          // Don't make first move immediately - wait for quiz answer
          console.log('Stockfish ready - waiting for first quiz answer');
        }
      };
      
      stockfishRef.current.addEventListener('message', initHandler);
      
    } catch (error) {
      console.error('Stockfish worker initialization failed:', error);
      // Clear timeout on error
      if (stockfishTimeoutRef.current) {
        clearTimeout(stockfishTimeoutRef.current);
        stockfishTimeoutRef.current = null;
      }
      // Show error to user
      setGameState(prev => ({
        ...prev,
        currentTaunt: "Error initializing AI. Please reload the page to try again."
      }));
    }

    return () => {
      // Cleanup function
      if (stockfishTimeoutRef.current) {
        clearTimeout(stockfishTimeoutRef.current);
      }
      if (stockfishRef.current) {
        console.log('Terminating Stockfish worker');
        stockfishRef.current.terminate();
      }
    };
  }, []);

  const handleStockfishMessage = async (e: MessageEvent) => {
    const message = e.data;
    if (message.startsWith('bestmove')) {
      // Clear any move timeout
      if (stockfishTimeoutRef.current) {
        clearTimeout(stockfishTimeoutRef.current);
        stockfishTimeoutRef.current = null;
      }
      
      const move = message.split(' ')[1];
      console.log(`Stockfish selected move: ${move}`);
      setIsThinking(false);
      
      if (!move || move === '(none)') {
        console.warn('Stockfish returned invalid move:', move);
        return;
      }
      
      try {
        // Make the actual move
        game.move(move);
        
        // Check game status AFTER AI move
        const gameEnded = await checkGameStatusAndUpdateState();

        if (!gameEnded) {
          // If game didn't end, it's player's turn
          console.log('Game continues, player\'s turn');
          setGameState(prev => ({
            ...prev,
            isQuizVisible: false, // Hide quiz after AI move
            playerCanMove: true, // Player can now move
            currentTaunt: gameState.lastMoveCorrect 
              ? "You answered correctly! Stewie made a weak move. Now it's your turn to move."
              : "Your knowledge was lacking! Stewie made a powerful move. Now it's your turn to move."
          }));
        }
      } catch (error) {
        console.error('Error processing Stockfish move:', error);
        setGameState(prev => ({
          ...prev,
          currentTaunt: "There was an error processing Stewie's move. Please try again."
        }));
      }
    }
  };

  const makeAIMove = (difficulty: 'easy' | 'hard') => {
    if (gameState.isGameOver) {
      console.log('Game is over, not making AI move');
      return;
    }

    setIsThinking(true);
    // Lower the 'easy' depth range to 1-3 for normal moves
    // Higher depth range for grandmaster moves when player answers incorrectly
    const depth = difficulty === 'easy'
      ? Math.floor(Math.random() * 3) + 1  // Depth 1-3 for normal moves
      : Math.floor(Math.random() * 3) + 10; // Depth 10-12 for grandmaster moves (reduced for performance)

    console.log(`Making AI move with ${difficulty} difficulty (depth ${depth})`);
    
    if (!stockfishRef.current) {
      console.error('Stockfish worker not available');
      setIsThinking(false);
      return;
    }
    
    // Set a timeout for the move calculation
    if (stockfishTimeoutRef.current) {
      clearTimeout(stockfishTimeoutRef.current);
    }
    
    stockfishTimeoutRef.current = setTimeout(() => {
      console.error('Stockfish move timeout');
      setIsThinking(false);
      setGameState(prev => ({
        ...prev,
        currentTaunt: "Stewie is taking too long to think. Trying again..."
      }));
      // Retry the move
      makeAIMove(difficulty);
    }, 15000); // 15 second timeout for move calculation
    
    try {
      stockfishRef.current.postMessage(`position fen ${game.fen()}`);
      stockfishRef.current.postMessage(`go depth ${depth}`);
    } catch (error) {
      console.error('Error sending command to Stockfish:', error);
      // Clear timeout on error
      if (stockfishTimeoutRef.current) {
        clearTimeout(stockfishTimeoutRef.current);
        stockfishTimeoutRef.current = null;
      }
      setIsThinking(false);
    }
  };

  const handleQuizAnswer = (selectedAnswer: string) => {
    if (gameState.isGameOver) return; // Don't process if game over

    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;

    // Update answer counts
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setIncorrectAnswersCount(prev => prev + 1);
    }

    const [nextQuestion, nextRemaining, nextUsed] = getNextQuestion();

    // Update the game state based on answer
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      remainingQuestions: nextRemaining,
      usedQuestions: nextUsed,
      isQuizVisible: false, // Hide quiz after answering
      lastMoveCorrect: isCorrect,
      playerCanMove: false, // Player cannot move until AI makes its move
      currentTaunt: isCorrect
        ? `Correct! ${gameState.currentQuestion.tauntCorrect} Stewie's grip on systemic oppression weakens! He will make a weaker move.`
        : `Incorrect. ${gameState.currentQuestion.tauntIncorrect} Stewie grows stronger with your ignorance and will make a powerful move!`
    }));

    // Set thinking state and make AI move with appropriate difficulty
    setIsThinking(true);
    if (isCorrect) {
      makeAIMove('easy'); // Easier move for correct answer
    } else {
      makeAIMove('hard'); // Harder move for incorrect answer
    }
  };

  // Must be synchronous for react-chessboard
  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    // Player can only move if it's their turn AND they've been granted permission after AI moved
    if (gameState.isGameOver || !gameState.playerCanMove || game.turn() !== 'b') {
      if (gameState.isGameOver) {
        console.log("DEBUG: Game is over, move not allowed.");
      } else if (!gameState.playerCanMove) {
        console.log("DEBUG: Player cannot move until AI has moved.");
        setGameState(prev => ({
          ...prev,
          currentTaunt: "Wait for Stewie to make his move based on your quiz answer first!"
        }));
      } else if (game.turn() !== 'b') {
        console.log("DEBUG: Not player's turn.");
        setGameState(prev => ({
          ...prev,
          currentTaunt: "It's not your turn yet!"
        }));
      }
      return false;
    }

    let moveSuccessful = false;
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Assuming promotion to queen
      });

      if (move === null) {
        console.log("DEBUG: Invalid player move attempted.");
        moveSuccessful = false;
      } else {
         console.log(`DEBUG: Player moved ${sourceSquare}-${targetSquare}`);
         moveSuccessful = true;

         // After player moves, check game status
         checkGameStatusAndUpdateState().then(gameEnded => {
            if (!gameEnded) {
              // If game didn't end, show the quiz for next AI move
              console.log("DEBUG: Player move successful, showing quiz for next AI move.");
              
              // Get next quiz question ready
              const [nextQuestion, nextRemaining, nextUsed] = getNextQuestion();
              
              setGameState(prev => ({
                ...prev,
                currentQuestion: nextQuestion,
                remainingQuestions: nextRemaining,
                usedQuestions: nextUsed,
                playerCanMove: false, // Player cannot move until next AI move
                isQuizVisible: true, // Show quiz for next AI move
                currentTaunt: "Your move made! Now answer this knowledge question to determine Stewie's next move."
              }));
            }
         }).catch(err => {
             // Handle potential errors from the async check if necessary
             console.error("Error during async game status check:", err);
         });
      }

    } catch (error) {
      console.error('Move error:', error);
      moveSuccessful = false; // Move failed
    }

    // Return the synchronous result of the move attempt
    return moveSuccessful;
  };

  const questionNumber = gameState.usedQuestions.length + 1;
  const totalQuestions = quizQuestions.length;

  return (
    <div className="game-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      padding: '0',
      margin: '0',
      background: 'linear-gradient(135deg, #061224 0%, #0a1c34 100%)',
      color: '#e8f4ff',
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }}>
      {/* Simplified styles to improve performance */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Responsive layout styles */
        .game-layout {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto auto 1fr auto;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }
        
        @media (min-width: 992px) {
          .game-layout {
            grid-template-columns: 50% 50%;
            grid-template-rows: auto 1fr;
          }
          
          .message-area {
            grid-column: 1 / 3;
            grid-row: 1;
          }
          
          .chessboard-area {
            grid-column: 1;
            grid-row: 2;
            justify-self: center;
            align-self: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .quiz-area {
            grid-column: 2;
            grid-row: 2;
            align-self: center;
          }
        }
      `}</style>
      
      <div className="game-layout">
        {/* Stewie and Message */}
        <div className="message-area" style={{display: 'flex', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.3)', maxHeight: '80px', overflow: 'hidden'}}>
          <img
            src="/stewie.png"
            alt="Stewie"
            style={{
              width: '40px',
              height: '40px',
              marginRight: '10px',
              borderRadius: '50%',
              border: '2px solid #193366'
            }}
          />
          <div style={{flex: 1}}>
            {isThinking ? 
              <p style={{fontSize: '14px', fontWeight: 'bold', margin: '0'}}>Stewie is thinking...</p> : 
              <p style={{fontSize: '14px', margin: '0'}}>{gameState.currentTaunt}</p>
            }
          </div>
        </div>
        
        {/* Chess Board */}
        <div className="chessboard-area" style={{padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 180px)'}}>
          <div style={{textAlign: 'center', marginBottom: '5px', color: 'lightblue', fontSize: '14px', fontWeight: 'bold'}}>
            You are playing as Black - Resisting Systemic Racism
          </div>
          <div style={{width: '85%', maxWidth: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 0 20px 0'}}>
            <Chessboard
              id="PlanetaryChessBoard"
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation="black"
              arePiecesDraggable={gameState.playerCanMove && !gameState.isGameOver}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 0 20px rgba(0, 195, 255, 0.3)',
                border: '3px solid #193366'
              }}
            />
          </div>
        </div>
        
        {/* Quiz Section */}
        <div className="quiz-area" style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {gameState.isQuizVisible ? (
            <div style={{width: '90%', maxWidth: '550px', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0, 195, 255, 0.2)', border: '1px solid #193366'}}>
              <h3 style={{color: 'lightblue', textAlign: 'center', fontSize: '18px', marginBottom: '15px'}}>{gameState.currentQuestion.question}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px'}}>
                {gameState.currentQuestion.options.map((option, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleQuizAnswer(option)}
                    style={{
                      padding: '12px 15px',
                      background: '#193366',
                      color: 'white',
                      border: '1px solid rgba(0, 195, 255, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#254680'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#193366'}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              <p style={{color: 'lightblue', fontSize: '14px', marginTop: '15px', textAlign: 'center'}}>
                Answer correctly to move your pieces!<br/>
                Incorrect answers strengthen Stewie's move.
              </p>
            </div>
          ) : (
            !gameState.isGameOver && (
              <div style={{width: '90%', maxWidth: '550px', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0, 195, 255, 0.2)', border: '1px solid #193366'}}>
                <h3 style={{color: 'lightblue', textAlign: 'center', fontSize: '18px'}}>Game Status</h3>
                <p style={{color: 'white', textAlign: 'center', fontSize: '16px', margin: '20px 0'}}>
                  {gameState.playerCanMove ? 
                    "It's your turn. Make your move to fight against systemic racism!" : 
                    "Waiting for quiz question..."}
                </p>
                <div style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img 
                    src="/stewie.png" 
                    alt="Stewie waiting" 
                    style={{opacity: 0.5, width: '100px', height: '100px'}} 
                  />
                </div>
              </div>
            )
          )}
          
          {/* Game Controls */}
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px', width: '90%', maxWidth: '550px'}}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 25px',
                background: '#193366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              Back to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 25px',
                background: '#193366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;