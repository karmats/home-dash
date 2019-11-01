import React from 'react';
import './Number.css';

export default function() {
  const number = 12000;
  return (
    <div className="Number-main">
      <div>{number.toLocaleString('SV-se')}</div>
    </div>
  );
}
