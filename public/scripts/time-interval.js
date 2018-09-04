function timeSince(date) {
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds) {
    const interval = intervals.find(i => i.seconds < seconds);
    const count = Math.floor(seconds / interval.seconds);
    if (count == 1) {
      console.log("count if == 1: ", count);
      return `${count} ${interval.label} ago`;
    } else if (count > 1) {
      console.log("count if > 1: ", count);
      return `${count} ${interval.label}s ago`;
    } else {
      return false;
    }
  } else {
    return "Brand new tweet";
  }
}
