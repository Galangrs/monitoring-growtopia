export const parseHistoryData = (historyArray) => {
  return historyArray.map((entry, index) => {
    // Parse format: "[Senin 27/10 16:16:51] Player : 75748 | Ban Rate : 0.06 | Banned Player : 4 | Nuked World : 0"
    const regex = /\[(.+?)\] Player : (\d+) \| Ban Rate : ([\d.]+) \| Banned Player : (\d+) \| Nuked World : (\d+)/;
    const match = entry.match(regex);
    
    if (match) {
      const [, timestamp, playerCount, banRate, bannedPlayer, nukedWorld] = match;
      return {
        id: index,
        timestamp: timestamp.trim(),
        playerCount: parseInt(playerCount),
        banRate: parseFloat(banRate),
        bannedPlayer: parseInt(bannedPlayer),
        nukedWorld: parseInt(nukedWorld),
        // Create a simple time for chart X-axis
        time: index
      };
    }
    return null;
  }).filter(Boolean).reverse(); // Reverse to show oldest first
};

export const formatTimestamp = (timestamp) => {
  // Convert "[Senin 27/10 16:16:51]" to readable format
  return timestamp.replace(/\[(.+?)\]/, '$1');
};