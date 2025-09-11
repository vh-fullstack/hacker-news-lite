import { parseISO, formatDistanceToNow } from 'date-fns';

const TimeAgo = ({ timestamp }) => {
  let timeAgo = '';
  if (timestamp) {
    // Parse the ISO string into a Data object
    const date = parseISO(timestamp)
    // Get the time difference from now and format it.
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} ago`;
  }

  return (
    <span title={timestamp}>
      &nbsp;<i>{timeAgo}</i>
    </span>
  )
};

export default TimeAgo;