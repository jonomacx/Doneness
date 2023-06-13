import React from 'react';

const ToggleButton = ({ label, value, onToggle }) => {
  const handleToggle = () => {
    onToggle(value);
  };

  return (
    <Button onPress={handleToggle}>
     title = {label}
    </Button>
  );
};

export default ToggleButton;

