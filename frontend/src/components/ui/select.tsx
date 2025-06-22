import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  selectedLabel: string
  setSelectedLabel: (label: string) => void
}>({
  open: false,
  setOpen: () => {},
  selectedLabel: "",
  setSelectedLabel: () => {},
})

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, value, onValueChange, defaultValue, disabled, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [open, setOpen] = React.useState(false)
    const [selectedLabel, setSelectedLabel] = React.useState("")
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback((newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
      setOpen(false)
    }, [value, onValueChange])

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, ref])

    return (
      <SelectContext.Provider value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel
      }}>
        <div
          ref={ref}
          className={cn("relative", className)}
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <svg
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value, selectedLabel } = React.useContext(SelectContext)

    return (
      <span
        ref={ref}
        className={cn("block truncate", !value && "text-gray-400", className)}
        {...props}
      >
        {selectedLabel || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(SelectContext)

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg",
          "max-h-60 overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setSelectedLabel } = React.useContext(SelectContext)
    const isSelected = selectedValue === value

    const handleClick = () => {
      onValueChange?.(value)
      if (typeof children === 'string') {
        setSelectedLabel(children)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-gray-100 focus:bg-gray-100",
          isSelected && "bg-blue-50 text-blue-900",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
