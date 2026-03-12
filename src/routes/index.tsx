import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Dice5, Trophy, Skull, Target, Cpu, User } from 'lucide-react'

import { formatSize } from '#/lib/npm-registry'
import { usePackageInfo } from '#/hooks/usePackageInfo'
import { useGame } from '#/hooks/useGame'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const game = useGame()
  const [pendingPlayerPackage, setPendingPlayerPackage] = useState<string | null>(null)
  const { data: playerPackageInfo, isLoading: isLoadingPlayer } = usePackageInfo(pendingPlayerPackage)
  const { data: dealerPackageInfo, isLoading: isLoadingDealer } = usePackageInfo(game.dealerPackageName)

  useEffect(() => {
    if (playerPackageInfo && !isLoadingPlayer && pendingPlayerPackage) {
      const isNewPackage = !game.playerPackages.some(p => p.name === playerPackageInfo.name)
      if (isNewPackage) {
        game.playerHit(playerPackageInfo)
        setPendingPlayerPackage(null)
      }
    }
  }, [playerPackageInfo, isLoadingPlayer, pendingPlayerPackage, game])

  useEffect(() => {
    if (dealerPackageInfo && !isLoadingDealer && game.dealerPackageName) {
      const isNewPackage = !game.dealerPackages.some(p => p.name === dealerPackageInfo.name) &&
        !game.playerPackages.some(p => p.name === dealerPackageInfo.name)
      if (isNewPackage) {
        game.handleDealerPackageLoaded(dealerPackageInfo)
      }
    }
  }, [dealerPackageInfo, isLoadingDealer, game])

  const handleStartGame = () => {
    game.startGame()
    setPendingPlayerPackage(null)
  }

  const handleHit = () => {
    const packageName = game.getNextPackage()
    setPendingPlayerPackage(packageName)
  }

  const handleStand = () => {
    game.stand()
    setPendingPlayerPackage(null)
  }

  const isGameOver = game.status === 'won' || game.status === 'lost' || game.status === 'bust' || game.status === 'dealerBust'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">npmjack</h1>

        {game.status === 'idle' && (
          <div className="text-center">
            <p className="mb-6 text-slate-300">
              Draw npm packages to get as close as possible to the target size in MB.
              Beat the dealer without going over!
            </p>
            <button
              onClick={handleStartGame}
              className="rounded-lg bg-green-600 px-8 py-4 text-xl font-semibold text-white transition-colors hover:bg-green-700"
            >
              Start Game
            </button>
          </div>
        )}

        {game.status !== 'idle' && (
          <>
            <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <div className="text-center">
                <div className="mb-1 text-sm text-slate-400">Target</div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-400">
                  <Target size={24} />
                  {game.targetMB.toFixed(2)} MB
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl border p-4 ${
                game.status === 'bust' ? 'border-red-600 bg-red-900/20' :
                game.status === 'won' ? 'border-green-600 bg-green-900/20' :
                'border-slate-700 bg-slate-800/50'
              }`}>
                <div className="mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <User className="text-blue-400" size={18} />
                  <span className="font-semibold text-white">You</span>
                </div>
                <div className="mb-2 text-center">
                  <span className={`text-2xl font-bold ${
                    game.playerTotalMB > game.targetMB ? 'text-red-400' :
                    game.status === 'won' ? 'text-green-400' : 'text-white'
                  }`}>
                    {game.playerTotalMB.toFixed(2)} MB
                  </span>
                </div>
                <div className="space-y-2">
                  {game.playerPackages.map((pkg, index) => (
                    <div
                      key={`player-${pkg.name}-${index}`}
                      className="flex items-center justify-between rounded bg-slate-700/50 px-2 py-1 text-sm"
                    >
                      <span className="text-slate-300">{pkg.name}</span>
                      <span className="font-mono text-slate-400">{formatSize(pkg.unpackedSize)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${
                game.status === 'dealerBust' ? 'border-green-600 bg-green-900/20' :
                game.status === 'lost' ? 'border-red-600 bg-red-900/20' :
                game.status === 'dealerTurn' ? 'border-yellow-600 bg-yellow-900/20' :
                'border-slate-700 bg-slate-800/50'
              }`}>
                <div className="mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <Cpu className="text-amber-400" size={18} />
                  <span className="font-semibold text-white">Dealer</span>
                  {game.status === 'dealerTurn' && (
                    <span className="ml-auto animate-pulse text-xs text-yellow-400">Drawing...</span>
                  )}
                </div>
                <div className="mb-2 text-center">
                  <span className={`text-2xl font-bold ${
                    game.dealerTotalMB > game.targetMB ? 'text-red-400' :
                    game.status === 'lost' ? 'text-red-400' :
                    game.status === 'dealerBust' ? 'text-green-400' : 'text-white'
                  }`}>
                    {game.dealerTotalMB.toFixed(2)} MB
                  </span>
                </div>
                <div className="space-y-2">
                  {game.dealerPackages.map((pkg, index) => (
                    <div
                      key={`dealer-${pkg.name}-${index}`}
                      className="flex items-center justify-between rounded bg-slate-700/50 px-2 py-1 text-sm"
                    >
                      <span className="text-slate-300">{pkg.name}</span>
                      <span className="font-mono text-slate-400">{formatSize(pkg.unpackedSize)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isLoadingPlayer && (
              <div className="mb-4 rounded-lg border border-yellow-700 bg-yellow-900/30 p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-200">
                  <Dice5 className="animate-spin" size={16} />
                  Drawing your package...
                </div>
              </div>
            )}

            {game.status === 'bust' && (
              <div className="mb-4 rounded-xl border border-red-600 bg-red-900/30 p-4 text-center">
                <Skull className="mx-auto mb-2 text-red-400" size={40} />
                <div className="text-xl font-bold text-red-400">Bust!</div>
                <div className="text-red-200">
                  You went over by {(game.playerTotalMB - game.targetMB).toFixed(3)} MB
                </div>
              </div>
            )}

            {game.status === 'dealerBust' && (
              <div className="mb-4 rounded-xl border border-green-600 bg-green-900/30 p-4 text-center">
                <Trophy className="mx-auto mb-2 text-green-400" size={40} />
                <div className="text-xl font-bold text-green-400">Dealer Busts! You Win!</div>
                <div className="text-green-200">
                  Dealer went over by {(game.dealerTotalMB - game.targetMB).toFixed(3)} MB
                </div>
              </div>
            )}

            {game.status === 'won' && (
              <div className="mb-4 rounded-xl border border-green-600 bg-green-900/30 p-4 text-center">
                <Trophy className="mx-auto mb-2 text-green-400" size={40} />
                <div className="text-xl font-bold text-green-400">You Win!</div>
                <div className="text-green-200">
                  You: {game.playerTotalMB.toFixed(3)} MB vs Dealer: {game.dealerTotalMB.toFixed(3)} MB
                </div>
              </div>
            )}

            {game.status === 'lost' && (
              <div className="mb-4 rounded-xl border border-red-600 bg-red-900/30 p-4 text-center">
                <Skull className="mx-auto mb-2 text-red-400" size={40} />
                <div className="text-xl font-bold text-red-400">Dealer Wins!</div>
                <div className="text-red-200">
                  You: {game.playerTotalMB.toFixed(3)} MB vs Dealer: {game.dealerTotalMB.toFixed(3)} MB
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {game.status === 'playing' && (
                <>
                  <button
                    onClick={handleHit}
                    disabled={isLoadingPlayer}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Dice5 className={isLoadingPlayer ? 'animate-spin' : ''} size={20} />
                    Hit
                  </button>
                  <button
                    onClick={handleStand}
                    disabled={isLoadingPlayer}
                    className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Stand
                  </button>
                </>
              )}

              {isGameOver && (
                <button
                  onClick={handleStartGame}
                  className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                >
                  New Game
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
