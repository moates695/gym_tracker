import { Text, View, StyleSheet } from "react-native";
import { Image } from 'expo-image';

import Button from '@/components/Button';

const PlaceholderImage = require('@/assets/images/react-logo.png');

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.footerContainer}>
        <Button label="Choose a photos" theme="primary" />
        <Button label="Use this photo" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});