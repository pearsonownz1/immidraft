import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useExperts } from '@/services/expertService';

interface SimpleExpertSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SimpleExpertSelector({ value, onChange, className }: SimpleExpertSelectorProps) {
  const { experts, loading, error } = useExperts();

  if (loading) {
    return <div>Loading experts...</div>;
  }

  if (error) {
    return <div>Error loading experts: {error}</div>;
  }

  if (!experts || experts.length === 0) {
    return <div>No experts available</div>;
  }

  return (
    <div className={className}>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        <option value="">Select an expert...</option>
        {experts.map((expert) => (
          <option key={expert.id} value={expert.id}>
            {expert.name} {expert.title ? `(${expert.title})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
