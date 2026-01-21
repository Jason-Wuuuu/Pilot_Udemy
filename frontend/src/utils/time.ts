export function getTimeRemaining(dueDate: string): { isOverdue: boolean; text: string } {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();

  if (diff <= 0) {
    return { isOverdue: true, text: "Overdue" };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { isOverdue: false, text: `${days}d ${hours}h left` };
  } else if (hours > 0) {
    return { isOverdue: false, text: `${hours}h ${minutes}m left` };
  } else {
    return { isOverdue: false, text: `${minutes}m left` };
  }
}
