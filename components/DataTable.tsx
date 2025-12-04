import { commonStyles } from "@/styles/commonStyles";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Grid, Row, Col } from "react-native-easy-grid";

export interface TableData<H extends readonly string[], V> {
  headers: H;
  rows: Array<Record<H[number], V>>
}

interface DataTableProps<H extends readonly string[], V> {
  tableData: TableData<H, V>
  capitalise?: boolean
  numRows?: number
  shade?: boolean
}

type RowType = Record<string, string | number>;

// todo: add page scroll, take num_rows as prop with default
// todo: for low number of points (say 2), do not need to repear X axis markings

export default function DataTable(props: DataTableProps<string[], string | number>) {
  const { tableData, capitalise = true, numRows = 10, shade = false } = props;

  const [pageIndex, setPageIndex] = useState<number>(0); 

  const indexLimit = (pageIndex + 1) * numRows < tableData.rows.length ? (pageIndex + 1) * numRows : tableData.rows.length;
  const numPages = Math.ceil(tableData.rows.length / numRows);

  const rows: RowType[] = ((): RowType[] => {
    const rows: RowType[] = [];
    for (let i = pageIndex * numRows; i < indexLimit; i++) {
      rows.push(tableData.rows[i]);
    }
    return rows;
  })();

  const shiftPageIndex = (direction: 'increase' | 'decrease') => {
    let tempIndex = pageIndex;
    if (direction === 'increase') {
      tempIndex++;
    } else {
      tempIndex--;
    }

    if (tempIndex < 0) {
      tempIndex = 0;
    } else if (tempIndex >= numPages) {
      tempIndex = numPages - 1;
    }

    setPageIndex(tempIndex);
  };

  return (
    <View 
      style={{
        marginBottom: 10,
      }}
    >
      <View>
        <Grid 
          style={{
            marginBottom: 5, 
            flexDirection: 'column',
            flex: 0,
          }}
        >
          <Row style={{flex: 0, padding: 4}}>
            {tableData.headers.map((header, index) => {
              return (
                <Col key={index}>
                  <Text style={[styles.text, {fontWeight: 700}]}>
                    {!capitalise || header === '' ? header : header.charAt(0).toUpperCase() + header.slice(1)}
                  </Text>
                </Col>
              )
            })}
          </Row>
          {rows.map((row, rowIndex) => {
            return (
              <Row 
                key={rowIndex} 
                style={{
                  flex: 0,
                  backgroundColor: shade ? (rowIndex % 2 ? '#000000': '#222328ff') : 'transparent',
                  borderRadius: 5,
                  padding: 4
                }}>
                {tableData.headers.map((header, colIndex) => {
                  return (
                    <Col key={colIndex} style={{flex: 1}}>
                      <Text style={[styles.text]}>{row[header]}</Text>
                    </Col>
                  )
                })}
              </Row>
            )
          })}
        </Grid>
      </View>
      {numPages > 1 &&
        <View 
          style={{
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-around',
          }}
        >
          <TouchableOpacity
            onPress={() => shiftPageIndex('decrease')}
            style={[commonStyles.thinTextButton, {width: 30, opacity: pageIndex === 0 ? 0 : 1}]}
          >
            <Feather name="chevron-left" size={14} color="white" />
          </TouchableOpacity>
          <Text style={styles.text}>
            {`Page ${pageIndex + 1}/${Math.ceil(tableData.rows.length / numRows)}`}
          </Text>
          <TouchableOpacity
            onPress={() => shiftPageIndex('increase')}
            style={[commonStyles.thinTextButton, {width: 30, opacity: pageIndex + 1 === numPages ? 0 : 1}]}
          >
            <Feather name="chevron-right" size={14} color="white" />
          </TouchableOpacity>
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    textAlign: 'center',
  },
})