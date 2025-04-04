import React from 'react';

export interface FormErrorSummaryProps {
  errors?: Record<string, string[]>;
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors = {},
  title = 'There was a problem with your submission'
}) => {
  const errorCount = Object.values(errors).flat().length;

  if (errorCount === 0) {
    return null;
  }

  return (
    <div className="error-summary" role="alert">
      <h2>{title}</h2>
      <ul>
        {Object.entries(errors).map(([field, fieldErrors]) =>
          fieldErrors.map((error, index) => (
            <li key={`${field}-${index}`}>
              <a href={`#${field}`}>{error}</a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
