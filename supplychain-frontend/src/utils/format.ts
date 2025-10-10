export const shorten = (addr='') => addr ? addr.slice(0,6)+'...'+addr.slice(-4) : '';
export const formatTime = (ts) => new Date(ts*1000).toLocaleString();
