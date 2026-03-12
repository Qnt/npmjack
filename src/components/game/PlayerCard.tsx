import { User, Cpu } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { PackageList } from './PackageList'
import type { PackageInfo } from '#/lib/npm-registry'

interface PlayerCardProps {
  title: 'You' | 'Dealer'
  icon: 'user' | 'dealer'
  totalMB: number
  packages: PackageInfo[]
  isDrawing?: boolean
}

export function PlayerCard({
  title,
  icon,
  totalMB,
  packages,
  isDrawing,
}: PlayerCardProps) {
  const Icon = icon === 'user' ? User : Cpu

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className="text-primary" size={18} />
          <span>{title}</span>
          {isDrawing && (
            <span className="ml-auto animate-pulse text-xs text-muted-foreground">
              Drawing...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 text-center">
          <span className="text-2xl font-bold text-foreground">
            {totalMB.toFixed(2)} MB
          </span>
        </div>
        <PackageList packages={packages} />
      </CardContent>
    </Card>
  )
}
