export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let output = '';
  if (days > 0) output += `${days}d `;
  if (hours > 0) output += `${hours}h `;
  if (minutes > 0) output += `${minutes}m `;
  output += `${remainingSeconds}s`;

  return output.trim();
};
