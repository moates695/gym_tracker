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

  const isLastOption = (index: number): boolean => {
    if (selectedIdx === options.length - 1) {
      return index === options.length - 2;
    }
    return index === options.length - 1;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.optionContainer, {'padding': 5}]}
      >
        <Text style={styles.text}>{options[selectedIdx].label}</Text>
      </TouchableOpacity>
      {isOpen && 
        <View 
          style={[styles.optionContainer, styles.dropdownContainer]}>
          {options.map((option, index) => (
            <View key={index}>
              {index !== selectedIdx &&
                <View
                  style={[
                    styles.dropdownOption,
                    !isLastOption(index) && styles.optionDivider,
                    {padding: 5}
                  ]}
                >
                  <TouchableOpacity 
                    onPress={() => handleSelectOption(index)}
                  >
                    <Text style={styles.text}>{option.label}</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          ))}
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  container: {
    flex: 0,
    width: 150
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    height: 30
  },
  optionContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 2,
    // padding: 5,
    justifyContent: 'center',
  },
  dropdownContainer: {
    zIndex: 999,
    top: 28,
    backgroundColor: 'black',
    position: 'absolute',
    width: 150,
  },
  dropdownOption: {
    padding: 3,
  }
})