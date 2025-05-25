import { useState } from 'react'
import React, {StyleSheet, View, Text, TouchableOpacity} from 'react-native'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  selectedIdx: number
  setSelectedIdx: (index: number) => void
  options: DropdownOption[]
}

export default function Dropdown(props: DropdownProps) {
  const {selectedIdx, setSelectedIdx, options} = props;

  const [isOpen, setIsOpen] = useState<Boolean>(false);

  const handleSelectOption = (index: number) => {
    setIsOpen(false);
    setSelectedIdx(index);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.text}>{options[selectedIdx].label}</Text>
      </TouchableOpacity>
      {isOpen && options.map((option, index) => (
        <View key={index}>
          { index !== selectedIdx &&
            <TouchableOpacity 
              onPress={() => handleSelectOption(index)}
            >
              <Text style={styles.text}>{option.label}</Text>
            </TouchableOpacity>
          }
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    flex: 0
  }
})