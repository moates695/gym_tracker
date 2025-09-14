import React from "react";
import { View, Text, StyleSheet } from 'react-native'
import { Grid, Row, Col } from "react-native-easy-grid";
import { Header } from "react-native/Libraries/NewAppScreen";

export interface TableData<H extends readonly string[], V> {
  headers: H;
  rows: Array<Record<H[number], V>>
}

interface DataTableProps<H extends readonly string[], V> {
  tableData: TableData<H, V>
  capitalise?: boolean
}

export default function DataTable(props: DataTableProps<string[], string | number>) {
  const { tableData, capitalise = true } = props;

  return (
    <Grid>
      <Row style={styles.gridRow}>
        {tableData.headers.map((header, index) => {
          return (
            <Col key={index}>
              <Text style={styles.text}>{!capitalise || header === '' ? header : header.charAt(0).toUpperCase() + header.slice(1)}</Text>
            </Col>
          )
        })}
      </Row>
      {tableData.rows.map((row, rowIndex) => {
        return (
          <Row key={rowIndex} style={styles.gridRow}>
            {tableData.headers.map((header, colIndex) => {
              return (
                <Col key={colIndex}>
                  <Text style={styles.text}>{row[header]}</Text>
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