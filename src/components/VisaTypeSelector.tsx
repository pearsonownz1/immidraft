import React, { useState, useEffect } from 'react';
import { sampleLetterService } from '@/services/sampleLetterService';

interface VisaTypeSelectorProps {
  value: string;
  onChange: (visaType: string) => void;
  className?: string;
}

const VisaTypeSelector: React.FC<VisaTypeSelectorProps> = ({ 
  value, 
  onChange,
  className = ''
}) => {
  const [availableVisaTypes, setAvailableVisaTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get all samples and extract unique visa types
    const samples = sampleLetterService.getAllSamples();
    const uniqueVisaTypes = Array.from(new Set(
      samples.map(sample => sample.visaType)
    )).filter(Boolean);

    // Add default visa types if they don't exist in samples
    const defaultTypes = ['O-1A', 'EB-1A', 'EB-2 NIW'];
    const allTypes = [...new Set([...uniqueVisaTypes, ...defaultTypes])];
    
    // Sort visa types
    allTypes.sort();
    
    setAvailableVisaTypes(allTypes);
    setLoading(false);
  }, []);

  return (
    <div className="relative">
      <select
        className={`px-3 py-2 border rounded-md text-sm ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        {loading ? (
          <option>Loading visa types...</option>
        ) : (
          availableVisaTypes.map((visaType) => (
            <option key={visaType} value={visaType}>
              {visaType} {sampleLetterService.getSamplesByVisaType(visaType).length > 0 ? '(Sample Available)' : ''}
            </option>
          ))
        )}
      </select>
      {sampleLetterService.getSamplesByVisaType(value).length > 0 && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

export default VisaTypeSelector;
