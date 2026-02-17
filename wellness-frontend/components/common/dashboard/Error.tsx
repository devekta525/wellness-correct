'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
}

const Error: React.FC<ErrorProps> = ({
  title = "Error",
  message = "Something went wrong. Please try again.",
  showRetry = true,
  onRetry,
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-2" />
        <div className="space-y-2 text-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {showRetry && (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

export default Error