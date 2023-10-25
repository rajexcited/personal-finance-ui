export const formatAmount = (amt?: string | number) => {
  const amtt = (amt && Number(amt)) || 0;
  return (amtt < 0 ? "-" : "") + "$ " + Math.abs(amtt).toFixed(2);
};
