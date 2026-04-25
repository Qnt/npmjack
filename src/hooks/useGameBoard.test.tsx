// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { PackageInfo } from '#/lib/npm-registry'

const mockUseGame = vi.fn()
const mockUsePackagePool = vi.fn()
const mockUsePackageInfo = vi.fn()

vi.mock('#/hooks/useGame', () => ({
  useGame: (...args: unknown[]) => mockUseGame(...args),
}))

vi.mock('#/hooks/usePackagePool', () => ({
  usePackagePool: (...args: unknown[]) => mockUsePackagePool(...args),
}))

vi.mock('#/hooks/usePackageInfo', () => ({
  usePackageInfo: (...args: unknown[]) => mockUsePackageInfo(...args),
}))

import { useGameBoard } from './useGameBoard'

function createPackageInfo(overrides: Partial<PackageInfo> = {}): PackageInfo {
  return {
    name: 'react',
    unpackedSize: 1024,
    version: '19.0.0',
    ...overrides,
  }
}

function createGameMock(overrides: Record<string, unknown> = {}) {
  return {
    clearPlayerDraw: vi.fn(),
    dealerPackageName: null as string | null,
    dealerPackages: [] as PackageInfo[],
    handleDealerPackageLoaded: vi.fn(),
    playerDraw: null as { packageName: string; drawId: number } | null,
    playerHit: vi.fn(),
    playerPackages: [] as PackageInfo[],
    rejectDealerPackage: vi.fn(),
    rejectPlayerPackage: vi.fn(),
    setPackagePool: vi.fn(),
    skipDealerPackage: vi.fn(),
    skipPlayerPackage: vi.fn(),
    startGame: vi.fn(),
    ...overrides,
  }
}

function createPackagePoolMock(overrides: Record<string, unknown> = {}) {
  return {
    data: ['react'],
    isError: false,
    isLoading: false,
    isSuccess: true,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('useGameBoard', () => {
  it('processes a player draw only once for the same draw id across rerenders', () => {
    const game = createGameMock({
      playerDraw: { packageName: 'react', drawId: 7 },
    })

    const playerInfo = createPackageInfo({ name: 'react', unpackedSize: 2048 })

    mockUseGame.mockReturnValue(game)
    mockUsePackagePool.mockReturnValue(createPackagePoolMock())
    mockUsePackageInfo.mockImplementation((packageName: string | null) => {
      if (packageName === 'react') {
        return {
          data: playerInfo,
          isError: false,
          isLoading: false,
        }
      }

      return { data: undefined, isError: false, isLoading: false }
    })

    const { rerender } = renderHook(() => useGameBoard())
    rerender()

    expect(game.playerHit).toHaveBeenCalledTimes(1)
    expect(game.playerHit).toHaveBeenCalledWith(playerInfo)
  })

  it('ignores stale player package payloads that do not match current draw package', () => {
    const game = createGameMock({
      playerDraw: { packageName: 'vue', drawId: 9 },
    })

    mockUseGame.mockReturnValue(game)
    mockUsePackagePool.mockReturnValue(createPackagePoolMock())
    mockUsePackageInfo
      .mockReturnValueOnce({
        data: createPackageInfo({ name: 'react', unpackedSize: 2048 }),
        isError: false,
        isLoading: false,
      })
      .mockReturnValueOnce({ data: undefined, isError: false, isLoading: false })

    renderHook(() => useGameBoard())

    expect(game.playerHit).not.toHaveBeenCalled()
    expect(game.rejectPlayerPackage).not.toHaveBeenCalled()
    expect(game.skipPlayerPackage).not.toHaveBeenCalled()
  })

  it('rejects player package draws with null unpacked size', () => {
    const game = createGameMock({
      playerDraw: { packageName: 'broken', drawId: 42 },
    })

    mockUseGame.mockReturnValue(game)
    mockUsePackagePool.mockReturnValue(createPackagePoolMock())
    mockUsePackageInfo
      .mockReturnValueOnce({
        data: createPackageInfo({ name: 'broken', unpackedSize: null }),
        isError: false,
        isLoading: false,
      })
      .mockReturnValueOnce({ data: undefined, isError: false, isLoading: false })

    renderHook(() => useGameBoard())

    expect(game.rejectPlayerPackage).toHaveBeenCalledWith('broken')
    expect(game.skipPlayerPackage).not.toHaveBeenCalled()
    expect(game.playerHit).not.toHaveBeenCalled()
  })

  it('skips dealer package when dealer info fetch fails', () => {
    const game = createGameMock({
      dealerPackageName: 'left-pad',
    })

    mockUseGame.mockReturnValue(game)
    mockUsePackagePool.mockReturnValue(createPackagePoolMock())
    mockUsePackageInfo
      .mockReturnValueOnce({ data: undefined, isError: false, isLoading: false })
      .mockReturnValueOnce({ data: undefined, isError: true, isLoading: false })

    renderHook(() => useGameBoard())

    expect(game.skipDealerPackage).toHaveBeenCalledWith('left-pad')
    expect(game.rejectDealerPackage).not.toHaveBeenCalled()
    expect(game.handleDealerPackageLoaded).not.toHaveBeenCalled()
  })

  it('skips duplicate dealer packages already present in player hand', () => {
    const game = createGameMock({
      dealerPackageName: 'react',
      playerPackages: [createPackageInfo({ name: 'react' })],
    })

    mockUseGame.mockReturnValue(game)
    mockUsePackagePool.mockReturnValue(createPackagePoolMock())
    mockUsePackageInfo
      .mockReturnValueOnce({ data: undefined, isError: false, isLoading: false })
      .mockReturnValueOnce({
        data: createPackageInfo({ name: 'react' }),
        isError: false,
        isLoading: false,
      })

    renderHook(() => useGameBoard())

    expect(game.handleDealerPackageLoaded).not.toHaveBeenCalled()
    expect(game.skipDealerPackage).toHaveBeenCalledWith('react')
  })
})
