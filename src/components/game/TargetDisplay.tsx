import { Target } from 'lucide-react'

import { Card, CardContent } from '#/components/ui/card'

interface TargetDisplayProps {
  targetMB: number
}

export function TargetDisplay({ targetMB }: TargetDisplayProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="mb-1 text-sm text-muted-foreground">Target</div>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
            <Target size={24} />
            {targetMB.toFixed(2)} MB
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
