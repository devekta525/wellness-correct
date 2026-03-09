import React from 'react'
import { FileX, Plus } from 'lucide-react'
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
  const sizeConfig = {
    sm: { wrapper: 'py-10 px-6', iconBox: 'w-12 h-12', title: 'text-sm', description: 'text-xs' },
    md: { wrapper: 'py-16 px-8', iconBox: 'w-16 h-16', title: 'text-base', description: 'text-sm' },
    lg: { wrapper: 'py-20 px-8', iconBox: 'w-20 h-20', title: 'text-lg', description: 'text-sm' },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50",
      config.wrapper,
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm mb-4 text-slate-300",
        config.iconBox
      )}>
        {icon || <FileX className="w-1/2 h-1/2" />}
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5 max-w-sm">
        <h3 className={cn("font-semibold text-slate-700", config.title)}>
          {message}
        </h3>
        {description && (
          <p className={cn("text-slate-400 leading-relaxed", config.description)}>
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <Button
          onClick={action.onClick}
          size={size === 'sm' ? 'sm' : 'default'}
          className="mt-6 gap-2 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default NoData
