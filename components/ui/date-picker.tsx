"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, toJalali } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseDateValue(value?: string) {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
}: DatePickerProps) {
  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date>();
  const selectedDate = isControlled ? parseDateValue(value) : internalDate;

  const onSelect = (date?: Date) => {
    if (!date) {
      if (!isControlled) {
        setInternalDate(undefined);
      }
      onValueChange?.("");
      return;
    }

    if (!isControlled) {
      setInternalDate(date);
    }
    onValueChange?.(format(date, "yyyy-MM-dd"));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!selectedDate}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-full justify-start text-start font-normal",
            className
          )}
        >
          <CalendarIcon />
          {selectedDate ? (
            <span>{toJalali(selectedDate)}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
