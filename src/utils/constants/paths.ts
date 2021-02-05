import { Path } from 'path-parser';
import { findKey } from 'lodash';

export const apiPaths = {
  connectPath: new Path('/api/connect'),
  statsPath: new Path('/api/stats'),
  networkPath: new Path('/api/network'),
  utilizationStatsPath: new Path('/api/utilization-stats'),
  broadcastersPath: new Path('/api/broadcasters'),
  broadcasterPath: new Path('/api/broadcasters/:broadcasterId'),
};

const allPaths = {
  ...apiPaths,
};

export const getPathName = (givenPath: string): string => {
  const pathName = findKey(allPaths, (path) => path.test(givenPath));
  return pathName || 'Unknown';
};
