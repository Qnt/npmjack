import { Dice5 } from 'lucide-react'

import { Alert, AlertDescription } from '#/components/ui/alert'

export function LoadingIndicator() {
  return (
    <Alert className="mb-4">
      <Dice5 className="animate-spin" size={16} />
      <AlertDescription>
        Drawing your package...
      </AlertDescription>
    </Alert>
  )
}
