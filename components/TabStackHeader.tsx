import { addCaughtErrorLogAtom, addErrorLogAtom } from '@/store/actions';
import { commonStyles } from '@/styles/commonStyles'
import { usePathname, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Modal } from 'react-native'

export interface TabStackHeaderProps {
  tab: string
}

export default function TabStackHeader(props: TabStackHeaderProps) {
  const { tab } = props;

  const router = useRouter();
  const pathname = usePathname();
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const getHeader = (): string => {
    try {
      let pathParts = pathname.split('/').slice(1);
      for (const i in pathParts) {
        pathParts[i] = pathParts[i].charAt(0).toUpperCase() + pathParts[i].slice(1);
      }
      return pathParts.join(' / ');
    } catch (error) {
      addCaughtErrorLog(error, 'error getHeader');
      return tab;
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.rowObject, {width: '50%'}]}>
        <Text style={commonStyles.boldText}>{getHeader()}</Text>
      </View>
      {pathname !== `/${tab}` &&
        <TouchableOpacity
          style={commonStyles.thinTextButton}
          onPress={() => router.replace(`/(tabs)/${tab}`)}
        >
          <Text style={styles.text}>back</Text>
        </TouchableOpacity>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  boldText: {
    fontWeight: 500,
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  rowObject: {
    width: '30%',
    justifyContent: 'center',
  },
  button: {
    padding: 1,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: 'green',
    alignItems: 'center',
    width: 80
  },
})