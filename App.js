/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState} from 'react';
import {StyleSheet, View, Button, TextInput} from 'react-native';
import JitsiRTC from './src/features/lib-jitsi-meet/JitsiRTC';

const App: () => React$Node = () => {
  const [roomId, setRoomId] = useState('5f4fb41ecf1bc5003500e8c4');

  const onConnect = () => {
    JitsiRTC.connect(roomId);
  };

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={styles.textInput}
          onChangeText={setRoomId}
          placeholder="room id"
          placeholderTextColor="gray"
          value={roomId}
        />
      </View>
      <View>
        <Button onPress={onConnect} title="Connect" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'lightgray',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    color: 'black',
  },
});

export default App;
