import React from 'react';
import { Button } from 'react-native';

const ToggleButton = ({ label, value, onToggle }) => {
  const handleToggle = () => {
    onToggle(value);
  };

  return (
    <Button onPress={handleToggle} title={label} />
  );
};

export default ToggleButton;

