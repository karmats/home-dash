import React from 'react';
import './Spinner.css';

export default function () {
  return (
    <div className="spinner-wrapper" role="alert" aria-live="assertive">
      <div className="spinner">Loading...</div>
    </div>
  );
}
