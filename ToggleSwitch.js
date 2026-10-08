import React from 'react';
import { Switch } from 'react-native-switch';

// On/off switch. The parent keeps the value, the same way it does for ToggleButton:
//   <ToggleSwitch value={clearDistractions} onToggle={setClearDistractions} />
const ToggleSwitch = ({ value, onToggle }) => (
  <Switch
    value={value}
    onValueChange={onToggle}
    disabled={false}
    activeText={'On'}
    inActiveText={'Off'}
    backgroundActive={'green'}
    backgroundInactive={'gray'}
    circleActiveColor={'#30a566'}
    circleInActiveColor={'#000000'}
  />
);

export default ToggleSwitch;
