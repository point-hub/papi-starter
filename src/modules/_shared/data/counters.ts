import type { ICounter } from '@/modules/counters/interface';

export const getCounters = (): ICounter[] => {
  return [
    { name: 'roles', template: 'ROLE/<seq>', seq: 1 },
    { name: 'examples', template: 'EXAMPLE/<seq>', seq: 0 },
  ];
};
