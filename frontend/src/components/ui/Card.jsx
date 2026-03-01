import React from 'react';

/**
 * Card component for consistent card styling
 */
const Card = React.forwardRef(
  ({ className = '', elevated = false, children, ...props }, ref) => {
    const baseStyles =
      'bg-white rounded-xl border border-slate-200 transition-all duration-200';
    const elevatedStyles = elevated
      ? 'shadow-lg hover:shadow-xl'
      : 'shadow-sm hover:shadow-md';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${elevatedStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card.Header - Top section of card with title/description
 */
const CardHeader = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-slate-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'Card.Header';

/**
 * Card.Content - Main content area
 */
const CardContent = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'Card.Content';

/**
 * Card.Footer - Bottom action area (usually with buttons)
 */
const CardFooter = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl flex items-center gap-3 justify-end ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'Card.Footer';

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
