'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Circle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Combinaciones ganadoras en el tablero 3x3
const winningCombos: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type CellValue = 'X' | 'O' | null;

export default function Custom404() {
  const [userSymbol, setUserSymbol] = useState<'X' | 'O'>('X');
  const [aiSymbol, setAiSymbol] = useState<'X' | 'O'>('O');

  // Estado del tablero y juego
  const [board, setBoard] = useState<Array<CellValue>>(Array(9).fill(null));
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const resetGame = () => {
    const rand = Math.random() < 0.5 ? 'X' : 'O';
    const user = rand;
    const ai = user === 'X' ? 'O' : 'X';
    setUserSymbol(user);
    setAiSymbol(ai);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsAiThinking(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  // Comprueba si hay ganador
  const checkWinner = (b: Array<CellValue>) => {
    for (const [a, bIdx, c] of winningCombos) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a];
      }
    }
    return null;
  };

  // Mpvimiento de la IA random
  const aiMove = (currentBoard: Array<CellValue>) => {
    const emptyIndexes = currentBoard
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((v): v is number => v !== null);
    if (emptyIndexes.length === 0) return currentBoard;
    const choice = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    const newBoard = [...currentBoard];
    newBoard[choice] = aiSymbol;
    return newBoard;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner || isAiThinking) return;
    // Turno usuario
    const userBoard = [...board];
    userBoard[idx] = userSymbol;
    const winUser = checkWinner(userBoard);
    setBoard(userBoard);
    if (winUser) {
      setWinner(winUser);
      return;
    }
    if (!userBoard.includes(null)) {
      setWinner('Draw');
      return;
    }
    // Turno IA
    setIsAiThinking(true);
    setTimeout(() => {
      const boardAfterAi = aiMove(userBoard);
      const winAi = checkWinner(boardAfterAi);
      setBoard(boardAfterAi);
      if (winAi) {
        setWinner(winAi);
      } else if (!boardAfterAi.includes(null)) {
        setWinner('Draw');
      }
      setIsAiThinking(false);
    }, 800);
  };

  return (
    <div className="bg-background/80 flex min-h-screen items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[360px]">
            <CardHeader className="text-center">
              <CardTitle>404 - Página no encontrada</CardTitle>
              <p className="text-muted-foreground text-sm">¡Juega al Tres en Raya contra la IA!</p>
              <p className="text-muted-foreground text-xs">
                Eres: <strong>{userSymbol}</strong> — IA: <strong>{aiSymbol}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1">
                {board.map((cell, i) => (
                  <motion.div
                    key={`cell-${i}-${cell}`}
                    className="bg-muted hover:bg-muted/70 flex h-16 w-16 cursor-pointer items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCellClick(i)}
                  >
                    {cell === 'X' && <X className="h-8 w-8 animate-pulse text-red-500" />}
                    {cell === 'O' && <Circle className="h-8 w-8 animate-pulse text-blue-500" />}
                  </motion.div>
                ))}
              </div>

              {winner && (
                <motion.div
                  className="mt-4 text-center text-lg font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {(() => {
                    if (winner === 'Draw') return '¡Empate!';
                    if (winner === userSymbol) return '¡Has ganado!';
                    return '¡Gana la IA!';
                  })()}
                </motion.div>
              )}

              <div className="mt-4 flex justify-center">
                <Button onClick={resetGame}>Reiniciar Juego</Button>
              </div>
              <div className='h-2.5'>
                {isAiThinking && (
                <motion.div
                  className="text-muted-foreground mt-2 text-center text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  IA pensando...
                </motion.div>
              )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
