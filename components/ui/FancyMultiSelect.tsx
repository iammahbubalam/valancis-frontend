"use client";

import * as React from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FancyMultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function FancyMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: FancyMultiSelectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
    setInputValue("");
    // Keep focus on input after selection
    inputRef.current?.focus();
  };

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
        handleUnselect(selected[selected.length - 1]);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [inputValue, selected],
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const selectables = filteredOptions.filter(
    (option) => !selected.includes(option.value),
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Container */}
      <div
        className="group border border-gray-200 px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 bg-white cursor-text"
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((itemValue) => {
            const option = options.find((o) => o.value === itemValue);
            return (
              <span
                key={itemValue}
                className="bg-secondary/10 text-secondary border border-secondary/20 rounded-md px-1.5 py-0.5 text-xs font-medium flex items-center gap-1"
              >
                {option?.label || itemValue}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-secondary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(itemValue);
                  }}
                >
                  <X className="h-3 w-3 text-secondary hover:text-red-500" />
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="ml-1 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[80px]"
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && selectables.length > 0 && (
        <div className="absolute w-full z-[100] mt-1 rounded-md border border-gray-200 bg-white text-popover-foreground shadow-xl outline-none animate-in fade-in-0 zoom-in-95">
          <ul className="max-h-[200px] overflow-y-auto overflow-x-hidden py-1">
            {selectables.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="cursor-pointer select-none relative flex w-full items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 transition-colors"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {open && selectables.length === 0 && inputValue && (
        <div className="absolute w-full z-[100] mt-1 rounded-md border border-gray-200 bg-white text-popover-foreground shadow-xl p-3 text-sm text-gray-500 text-center">
          No options found for "{inputValue}"
        </div>
      )}
    </div>
  );
}
