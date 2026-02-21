import React from 'react';

const MailLoader = ({ text = "Generating" }) => {
  const letters = text.split('');
  
  return (
    <div className="loader-wrapper">
      {letters.map((letter, index) => (
        <span key={index} className="loader-letter">
          {letter}
        </span>
      ))}
      <div className="loader"></div>
    </div>
  );
};

export default MailLoader;
