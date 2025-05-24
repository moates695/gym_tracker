import React, { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type ConfirmationModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const { visible, onConfirm, onCancel } = props;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.text}>Are you sure you want to delete?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onConfirm}
            >
              <Text>yes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onCancel}
            >
              <Text>no</Text>
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
    backgroundColor: 'purple',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})