import { CalendarIcon } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"

interface DatePickerFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  disabled,
}: DatePickerFieldProps) {
  const selectedDate =
    value && isValid(parseISO(value)) ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-10 w-full justify-start bg-white text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          {selectedDate ? (
            format(selectedDate, "dd/MM/yyyy", { locale: fr })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, "yyyy-MM-dd"))
          }}
          locale={fr}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}