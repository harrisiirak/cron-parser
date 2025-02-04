export interface BenchmarkInput {
  pattern: string;
  description?: string;
}

export const benchmarkInputs: BenchmarkInput[] = [
  { pattern: '* * * * * *', description: 'Every second' },
  { pattern: '0 15 */5 5 *', description: 'Every 5 days at 15:00 in May' },
  { pattern: '10-30/2 2 12 8 0', description: 'Every 2 minutes from 10-30 at 2am on Aug 12th, Sunday' },
  { pattern: '10 2 12 8 7', description: 'At 02:10 on the 12th day of August and every Sunday' },
  { pattern: '0 12 */5 6 *', description: 'At 12:00 on every 5th day of June' },
  { pattern: '0 * * 1,4-10,L * *', description: 'Every hour on the 1st, 4th through 10th, and last day of every month' },
  { pattern: '0 0 0 * * 4,6L', description: 'At midnight on every Thursday and last Saturday of every month' },
  { pattern: '0 0 0 * * 1L,5L', description: 'At midnight on the last Monday and last Friday of every month' },
  { pattern: '0 0 6-20/2,L 2 *', description: 'At midnight on every 2nd hour between 6-20 and last day in February' }
];
