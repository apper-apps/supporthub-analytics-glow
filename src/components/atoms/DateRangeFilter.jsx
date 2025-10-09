import React, { useEffect, useState } from "react";
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths, subWeeks } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const DateRangeFilter = ({ onChange, dateFrom, mode, onModeChange, selectedMonth: propSelectedMonth, selectedWeek: propSelectedWeek }) => {
const [localMode, setLocalMode] = useState(mode || 'custom');
  const [customDate, setCustomDate] = useState(dateFrom || '');
  const [localSelectedMonth, setLocalSelectedMonth] = useState('');
  const [localSelectedWeek, setLocalSelectedWeek] = useState('');
  
  // Use prop values if provided, otherwise use local state
  const selectedMonth = propSelectedMonth !== undefined ? propSelectedMonth : localSelectedMonth;
  const selectedWeek = propSelectedWeek !== undefined ? propSelectedWeek : localSelectedWeek;

  // Sync local mode with prop mode when it changes
  useEffect(() => {
    if (mode) {
      setLocalMode(mode);
    }
  }, [mode]);

const handleModeChange = (newMode) => {
    setLocalMode(newMode);
    if (onModeChange) onModeChange(newMode);
    // Clear dates when changing mode
    if (onChange) onChange(null, null);
  };

  const handleCustomDateChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };
const handleMonthSelect = (value) => {
    if (value && onChange) {
      setLocalSelectedMonth(value);
      setLocalSelectedWeek(''); // Clear week selection when month is selected
      const monthsAgo = parseInt(value);
      const targetDate = subMonths(new Date(), monthsAgo);
      const from = format(startOfMonth(targetDate), 'yyyy-MM-dd');
      setLocalMode('month'); // Maintain month mode after selection
      if (onModeChange) onModeChange('month');
      onChange(from, null, value, ''); // Pass selectedMonth and selectedWeek to parent
    }
  };

const handleWeekSelect = (value) => {
if (value && onChange) {
      setLocalSelectedWeek(value);
      setLocalSelectedMonth(''); // Clear month selection when week is selected
      const weeksAgo = parseInt(value);
      const targetDate = subWeeks(new Date(), weeksAgo);
      const from = format(startOfWeek(targetDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      setLocalMode('week'); // Maintain week mode after selection
      if (onModeChange) onModeChange('week');
      onChange(from, null, '', value); // Pass selectedMonth and selectedWeek to parent
    }
  };
  const handleClear = () => {
    if (onChange) onChange(null, null);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i.toString(),
      label: format(date, 'MMMM yyyy')
    };
  });

  const weekOptions = Array.from({ length: 12 }, (_, i) => {
    const targetDate = subWeeks(new Date(), i);
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
    return {
      value: i.toString(),
      label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`
    };
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
        <button
          onClick={() => handleModeChange('custom')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            localMode === 'custom'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Custom
        </button>
        <button
          onClick={() => handleModeChange('month')}
          className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
            localMode === 'month'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => handleModeChange('week')}
          className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
            localMode === 'week'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Week
        </button>
      </div>
{localMode === 'custom' && (
        <>
          <Input
            type="date"
            value={dateFrom || ''}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            className="w-40"
            placeholder="Select date"
          />
        </>
      )}

      {localMode === 'month' && (
<Select
          value={selectedMonth}
          onChange={(e) => handleMonthSelect(e.target.value)}
          className="min-w-[180px]"
        >
          <option value="">Select Month</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}

{localMode === 'week' && (
        <Select
          value={selectedWeek}
          onChange={(e) => handleWeekSelect(e.target.value)}
          className="min-w-[200px]"
        >
          <option value="">Select Week</option>
          {weekOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
{dateFrom && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="ml-1"
        >
          <ApperIcon name="X" size={16} />
        </Button>
      )}
    </div>
  );
};

export default DateRangeFilter;