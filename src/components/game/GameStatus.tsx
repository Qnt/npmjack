import { Trophy, Skull } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import type { GameStatus as GameStatusType } from '#/hooks/useGame'

interface GameStatusProps {
  status: GameStatusType
  playerTotalMB: number
  dealerTotalMB: number
  targetMB: number
}

export function GameStatus({ status, playerTotalMB, dealerTotalMB, targetMB }: GameStatusProps) {
  if (status === 'bust') {
    return (
      <Alert variant="destructive" className="mb-4">
        <Skull size={40} />
        <AlertTitle className="text-xl">Bust!</AlertTitle>
        <AlertDescription>
          You went over by {(playerTotalMB - targetMB).toFixed(3)} MB
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'dealerBust') {
    return (
      <Alert className="mb-4">
        <Trophy size={40} />
        <AlertTitle className="text-xl">Dealer Busts! You Win!</AlertTitle>
        <AlertDescription>
          Dealer went over by {(dealerTotalMB - targetMB).toFixed(3)} MB
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'won') {
    return (
      <Alert className="mb-4">
        <Trophy size={40} />
        <AlertTitle className="text-xl">You Win!</AlertTitle>
        <AlertDescription>
          You: {playerTotalMB.toFixed(3)} MB vs Dealer: {dealerTotalMB.toFixed(3)} MB
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'lost') {
    return (
      <Alert variant="destructive" className="mb-4">
        <Skull size={40} />
        <AlertTitle className="text-xl">Dealer Wins!</AlertTitle>
        <AlertDescription>
          You: {playerTotalMB.toFixed(3)} MB vs Dealer: {dealerTotalMB.toFixed(3)} MB
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
