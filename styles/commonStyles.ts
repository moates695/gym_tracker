import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  button: {
    padding: 3,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: 'red',
    minWidth: 100,
    alignItems: 'center'
  },
  redBorder: {
    borderColor: 'red',
  },
  greenBorder: {
    borderColor: 'green',
  },
  boldText: {
    fontWeight: 500,
    fontSize: 20,
    color: 'white',
  },
  textButton: {
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 2,
    padding: 2,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: 'grey',
  },
  thinTextButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    padding: 1,
    paddingLeft: 8,
    paddingRight: 8,
    minWidth: 80,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  thinTextButtonHighlighted: {
    backgroundColor: '#e0e0e0ff',
    borderColor: '#e0e0e0ff',
  },
  text: {
    color: 'white'
  },
  formHeader: {
    fontSize: 16,
    marginBottom: 5,
    color: "white"
  },
  input: {
    // flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    color: "white"
  }
})