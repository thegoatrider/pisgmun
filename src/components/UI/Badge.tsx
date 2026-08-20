import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();
  
  let className = 'status-badge ';
  if (normalizedStatus === 'approved' || normalizedStatus === 'open') {
    className += 'approved';
  } else if (normalizedStatus === 'pending' || normalizedStatus === 'not assigned') {
    className += 'pending';
  } else {
    className += 'rejected'; // rejected, closed, etc.
  }

  return (
    <span className={className}>
      {status}
    </span>
  );
};
