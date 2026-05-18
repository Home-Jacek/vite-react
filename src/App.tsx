import { useState } from 'react'
import './App.css'

type CellValue = 'X' | 'O' | null

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function calculateWinner(board: CellValue[]): { winner: CellValue; line: number[] } | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] }
    }
  }
  return null
}

function App() {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 })

  const result = calculateWinner(board)
  const isDraw = !result && board.every((cell) => cell !== null)

  function handleClick(index: number) {
    if (board[index] || result) return

    const newBoard = [...board]
    newBoard[index] = xIsNext ? 'X' : 'O'
    setBoard(newBoard)
    setXIsNext(!xIsNext)

    const newResult = calculateWinner(newBoard)
    if (newResult) {
      setScores((prev) => ({
        ...prev,
        [newResult.winner === 'X' ? 'x' : 'o']: prev[newResult.winner === 'X' ? 'x' : 'o'] + 1,
      }))
    } else if (newBoard.every((cell) => cell !== null)) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
  }

  let statusText: string
  let statusClass = 'status'
  if (result) {
    statusText = `${result.winner} wins!`
    statusClass += ' winner'
  } else if (isDraw) {
    statusText = "It's a draw!"
    statusClass += ' draw'
  } else {
    statusText = `Next player: ${xIsNext ? 'X' : 'O'}`
  }

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <div className="score-board">
        <span className="score-x">X: {scores.x}</span>
        <span className="score-draw">Draws: {scores.draws}</span>
        <span className="score-o">O: {scores.o}</span>
      </div>
      <div className={statusClass}>{statusText}</div>
      <div className="board">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`cell${cell ? ` ${cell.toLowerCase()}` : ''}${result?.line.includes(i) ? ' winning' : ''}`}
            onClick={() => handleClick(i)}
            disabled={!!cell || !!result}
          >
            {cell}
          </button>
        ))}
      </div>
      <button className="reset-btn" onClick={resetGame}>
        New Game
      </button>
    </div>
  )
}

export default App
