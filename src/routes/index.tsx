import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Dice5, ExternalLink, Package as PackageIcon } from 'lucide-react'

import { fetchPackageInfo, formatSize } from '#/lib/npm-registry'
import { getRandomPackage } from '#/lib/random-package'
import type { PackageInfo } from '#/lib/npm-registry'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetRandomPackage = async () => {
    setLoading(true)
    setError(null)
    setPackageInfo(null)

    try {
      const packageName = getRandomPackage()
      const info = await fetchPackageInfo(packageName)
      setPackageInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch package')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">npmjack</h1>

        <div className="mb-8 flex justify-center">
          <button
            onClick={handleGetRandomPackage}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Dice5 className={loading ? 'animate-spin' : ''} size={20} />
            {loading ? 'Fetching...' : 'Get Random Package'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/50 p-4 text-center text-red-200">
            {error}
          </div>
        )}

        {packageInfo && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <PackageIcon className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold text-white">{packageInfo.name}</h2>
              <span className="rounded bg-slate-700 px-2 py-0.5 text-sm text-slate-300">
                v{packageInfo.version}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-slate-400">Size:</span>
                <span className="font-mono text-white">
                  {formatSize(packageInfo.unpackedSize)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Repository:</span>
                {packageInfo.repositoryUrl ? (
                  <a
                    href={packageInfo.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300"
                  >
                    {packageInfo.repositoryUrl}
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-slate-500">Not available</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
