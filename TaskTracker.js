import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ToggleButton from './ToggleButton';

const TaskTracker = () => {
  const renderContent = () => {
    return <Text>Here's your task:[task details]</Text>;
  };

  return (
    <View>
      <Text>{renderContent()}</Text>
    </View>
  );
};
export default TaskTracker;




  /*
 const [takeTask, setTakeTask] = useState(false);
  const [clearDistractions, setClearDistractions] = useState(false);

  const handleTakeTaskToggle = (value) => {
    setTakeTask(value);
    setClearDistractions(false);
  };

  const handleClearDistractionsToggle = (value) => {
    setClearDistractions(value);
  };
*/


 /*   if (!takeTask) {
      return (
        <ToggleButton
          label="Take a task"
          value={true}
          onToggle={handleTakeTaskToggle}
        />
      );
    }

    if (!clearDistractions) {
      return (
        <ToggleButton
          label="Have you cleared all distractions?"
          value={true}
          onToggle={handleClearDistractionsToggle}
        />
      );
    }
  */  
    // Fetch a task from the datastore and display it


   // return <div>Here's your task: [task details]</div>


