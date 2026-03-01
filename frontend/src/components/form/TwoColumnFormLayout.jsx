import React from 'react';

/**
 * TwoColumnFormLayout component
 * 2-column responsive layout for forms on desktop
 * Stacks to single column on mobile
 */
const TwoColumnFormLayout = ({ children, isLoading = false }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
        isLoading ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default TwoColumnFormLayout;
