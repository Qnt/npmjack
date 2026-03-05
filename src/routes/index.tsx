import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">npmjack</h1>
    </main>
  )
}
