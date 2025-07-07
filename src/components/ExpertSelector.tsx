import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useExperts } from '@/services/expertService';

interface ExpertSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ExpertSelector({ value, onChange, className }: ExpertSelectorProps) {
  const [open, setOpen] = useState(false);
  const { experts, loading, error } = useExperts();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading experts...
            </span>
          ) : value ? (
            experts?.find((expert) => expert.id === value)?.name || 'Select expert...'
          ) : (
            'Select expert...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search experts..." />
          <CommandEmpty>
            {loading ? 'Loading...' : error ? 'Error loading experts' : 'No expert found.'}
          </CommandEmpty>
          <CommandGroup>
            {experts && experts.length > 0 ? (
              experts.map((expert) => (
                <CommandItem
                  key={expert.id}
                  value={expert.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === expert.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{expert.name}</span>
                    {expert.title && (
                      <span className="text-xs text-muted-foreground">
                        {expert.title}{expert.organization ? `, ${expert.organization}` : ''}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No experts available</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
