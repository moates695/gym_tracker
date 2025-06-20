import React from "react";
import { View, Text, StyleSheet } from 'react-native'
import { Grid, Row, Col } from "react-native-easy-grid";
import { Header } from "react-native/Libraries/NewAppScreen";

interface DataTableProps {
  headers: string[]
  rows: (number | string)[][]
}

export default function DataTable(props: DataTableProps) {
  const {headers, rows} = props;

  return (
    <Grid>
      <Row style={styles.gridRow}>
        {headers.map((header, index) => {
          return (
            <Col key={index}>
              <Text style={styles.text}>{header}</Text>
            </Col>
          )
        })}
      </Row>
      {rows.map((row, rowIndex) => {
        return (
          <Row key={rowIndex} style={styles.gridRow}>
            {row.map((col, colIndex) => {
              return (
                <Col key={colIndex}>
                  <Text style={styles.text}>{col}</Text>
                </Col>
              )
            })}
          </Row>
        )
      })}
    </Grid>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    textAlign: 'center',
  },
  gridRow: {
    height: 20
  }
})