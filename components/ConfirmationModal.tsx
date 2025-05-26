import React, { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { commonStyles } from "@/styles/commonStyles";

type ConfirmationModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  confirm_string: string
  cancel_string: string
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const { visible, onConfirm, onCancel, message, confirm_string, cancel_string } = props;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onConfirm}
              style={[commonStyles.button,commonStyles.redBorder]}
            >
              <Text style={styles.text}>{confirm_string}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onCancel}
              style={[commonStyles.button,{borderColor: 'gray'}]}
            >
              <Text style={styles.text}>{cancel_string}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%'
  },
   overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderColor: 'gray',
    borderWidth: 5,
    borderRadius: 10,
    backgroundColor: 'black',
    width: '60%',
    height: 100,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  }
})