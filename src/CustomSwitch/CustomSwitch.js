// CustomSwitch.js
import React, { useState } from 'react';
import './CustomSwitch.css'; // Create a CSS file for styling

const CustomSwitch = ({ options, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(options[0].value);

  const handleSwitchChange = (value) => {
    setSelectedOption(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="custom-switch">
      {options.map((option) => (
        <label key={option.value} className={`switch-label ${selectedOption === option.value ? 'active' : ''}`}>
          <input
            type="radio"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={() => handleSwitchChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default CustomSwitch;
