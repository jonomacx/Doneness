import React from 'react';
import { Switch } from 'react-native-switch';


state = { switchValue: false };
ToggleSwitch = () => {
    this.setState({ switchValue: !this.state.switchValue });
};

export const App = () => (
    <Switch
    value={this.state.switchValue}
    onValueChange={this.ToggleSwitch}
    disabled={false}
    activeText={'On'}
    inActiveText={'Off'}
    backgroundActive={'green'}
    backgroundInactive={'gray'}
    circleActiveColor={'#30a566'}
    circleInActiveColor={'#000000'}
    />
)