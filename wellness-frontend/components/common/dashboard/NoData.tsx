import React from 'react'
import { FileQuestion, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NoDataProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NoData: React.FC<NoDataProps> = ({ 
  message, 
  description, 
  icon, 
  action,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      wrapper: 'p-4 space-y-2',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      wrapper: 'p-6 space-y-3',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      wrapper: 'p-8 space-y-4',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg',
    },
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full min-h-[200px] rounded-lg border border-dashed animate-in fade-in-50 duration-500",
      sizeClasses[size].wrapper,
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "text-muted-foreground/60",
        sizeClasses[size].icon
      )}>
        {icon || <FileQuestion className="w-full h-full" />}
      </div>

      {/* Text Content */}
      <div className="text-center space-y-1">
        <h3 className={cn(
          "font-semibold text-foreground",
          sizeClasses[size].title
        )}>
          {message}
        </h3>
        {description && (
          <p className={cn(
            "text-muted-foreground",
            sizeClasses[size].description
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          className="mt-4 gap-2"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default NoData