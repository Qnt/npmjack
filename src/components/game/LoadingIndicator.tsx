import { Dice5 } from 'lucide-react'

import { Alert, AlertDescription } from '#/components/ui/alert'

export function LoadingIndicator() {
  return (
    <Alert className="status-shell mb-4 rounded-[24px] border border-sky-400/20 bg-sky-500/10 px-4 py-3">
      <Dice5 className="size-5 animate-spin text-sky-100" />
      <AlertDescription className="flex flex-col gap-1 text-foreground">
        <span className="font-display text-xs uppercase">Querying the npm deck</span>
        <span className="text-xs leading-6 text-muted-foreground">
          Pulling package metadata before it lands in your hand.
        </span>
      </AlertDescription>
    </Alert>
  )
}
