import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = 'right', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col gap-4 bg-card border-border p-6 shadow-lg transition-transform duration-300',
        side === 'right' && 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
        side === 'left' && 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SheetContent.displayName = 'SheetContent'

function SheetClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none cursor-pointer"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
  )
)
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
SheetDescription.displayName = 'SheetDescription'

export { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription }
