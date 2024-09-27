'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { TimePicker } from './time-picker';

const recurrenceSchema = z.object({
  startDate: z.date(),
  endDate: z.date().optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().min(1).default(1),
  daysOfWeek: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  nthDay: z.number().min(1).max(31).optional(),
});

export default function DateTimePickerForm() {
  const form = useForm({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: {
      recurrenceType: 'daily',
      interval: 1,
    },
  });

  const onSubmit = (values) => {
    console.log(values);
  };

  const { register, watch, setValue } = form;
  const watchRecurrenceType = watch('recurrenceType');
  const watchStartDate = watch('startDate');

  const getRecurringDates = (startDate, recurrenceType, interval) => {
    let dates = [startDate];
    for (let i = 1; i <= 5; i++) {
      let newDate;
      switch (recurrenceType) {
        case 'daily':
          newDate = addDays(startDate, i * interval);
          break;
        case 'weekly':
          newDate = addWeeks(startDate, i * interval);
          break;
        case 'monthly':
          newDate = addMonths(startDate, i * interval);
          break;
        case 'yearly':
          newDate = addYears(startDate, i * interval);
          break;
      }
      dates.push(newDate);
    }
    return dates;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
      <div className='flex flex-col space-y-4'>
        <label>Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !watchStartDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {watchStartDate ? (
                format(watchStartDate, 'PPP')
              ) : (
                <span>Select a start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={watchStartDate}
              onSelect={(date) => setValue('startDate', date)}
            />
          </PopoverContent>
        </Popover>

        <label>End Date (Optional)</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !form.watch('endDate') && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {form.watch('endDate') ? (
                format(form.watch('endDate'), 'PPP')
              ) : (
                <span>Select an end date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={form.watch('endDate')}
              onSelect={(date) => setValue('endDate', date)}
            />
          </PopoverContent>
        </Popover>

        <label>Recurrence Type</label>
        <select {...register('recurrenceType')}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <label>Every</label>
        <input
          type="number"
          {...register('interval')}
          min="1"
          defaultValue="1"
          className='border p-2'
        />

        {watchRecurrenceType === 'weekly' && (
          <div>
            <label>Select Days of the Week</label>
            <div className='grid grid-cols-7 gap-2'>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <label key={day}>
                  <input
                    type='checkbox'
                    value={day}
                    {...register('daysOfWeek')}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}

        {watchRecurrenceType === 'monthly' && (
          <div>
            <label>Select nth day of the month</label>
            <input type="number" {...register('nthDay')} min="1" max="31" />
          </div>
        )}
      </div>

      <div>
        <label>Preview</label>
        <div className='p-4 border rounded'>
          {watchStartDate ? (
            <ul>
              {getRecurringDates(
                watchStartDate,
                watchRecurrenceType,
                form.watch('interval')
              ).map((date, index) => (
                <li key={index}>{format(date, 'PPP')}</li>
              ))}
            </ul>
          ) : (
            <p>No recurring dates selected yet.</p>
          )}
        </div>
      </div>

      <Button type='submit'>Submit</Button>
    </form>
  );
}
