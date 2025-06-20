import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Grid, Row, Col } from "react-native-easy-grid";
import { Header } from "react-native/Libraries/NewAppScreen";
import DataTable from "./DataTable";
import { commonStyles } from "@/styles/commonStyles";
import AntDesign from '@expo/vector-icons/AntDesign';

interface CarouselDataTableProps {
  headers: string[]
  rows: (number | string)[][]
}

export default function CarouselDataTable(props: CarouselDataTableProps) {
  const {headers, rows} = props;
  
  const numRows = 10;
  const numSegments = Math.ceil(rows.length / numRows);

  const [segmentIndex, setSegmentIndex] = useState<number>(0);

  const getRowSegment = (): (number | string)[][] => {
    const startIndex = segmentIndex * numRows;
    return rows.slice(startIndex, startIndex + numRows)
  };

  const updateSegmentIndex = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= numSegments) return;
    setSegmentIndex(newIndex);
  };

  useEffect(() => {
    setSegmentIndex(0);
  }, [rows]);

  return (
    <View style={styles.tableContainer}>
      <DataTable
        headers={headers}
        rows={getRowSegment()}
      />
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => updateSegmentIndex(segmentIndex - 1)}
          style={[commonStyles.thinTextButton, {width: 50}]}
        >
          <AntDesign name="left" size={12} color="white" />
        </TouchableOpacity>
        <Text style={styles.text}>
          Page: {segmentIndex + 1}/{numSegments}
        </Text>
        <TouchableOpacity
          onPress={() => updateSegmentIndex(segmentIndex + 1)}
          style={[commonStyles.thinTextButton, {width: 50}]}
        >
          <AntDesign name="right" size={12} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  tableContainer: {
    justifyContent: 'center',
    height: 250,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 5,
  }
})