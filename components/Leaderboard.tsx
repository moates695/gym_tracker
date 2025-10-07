import { LeaderboardData, LeaderboardListItem, userDataAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { Text, View, StyleSheet, ScrollView } from 'react-native';

export interface LeaderboardProps {
  data: LeaderboardData | null
}

// todo fix leaderboard row spacing with different string lengths

export function Leaderboard(props: LeaderboardProps) {
  const {data} = props;

  const userData = useAtomValue(userDataAtom);

  if (data === null) {
    console.log('here113');
    return (
      <Text style={commonStyles.text}>
        no leaderboard data
      </Text>
    )
  }

  const showTopNum = 20;
  // const testLength = 50;
  // const data: LeaderboardData = {
  //   fracture: 20,
  //   leaderboard: [],
  //   num_rows: testLength,
  //   user_rank: 28,
  //   friend_ids: [],
  //   rank_data: []
  // };
  // for (let i = 0; i < testLength; i++) {
  //   data.leaderboard.push({
  //     user_id: i === 28 ? userData!.user_id : '',
  //     username: 'testtesttest',
  //     rank: i + 1,
  //     value: testLength - i
  //   })
  // }

  // todo extract row building to a function
  // todo highlight user and friends in list?

  const leaderboardHeaders = (
    <View 
      style={{
        flexDirection: 'row',
        width: '95%',
        justifyContent: 'space-between',
        padding: 5,
        borderRadius: 5,
        alignSelf: 'center',
        marginTop: 5
      }}
    >
      <Text style={commonStyles.text}>Rank</Text>
      <View 
        style={{
          width: '30%',
          alignItems: 'center'
        }}
      >
        <Text style={commonStyles.text}>Username</Text>
      </View>
      <View 
        style={{
          width: '30%',
          alignItems: 'flex-end',
        }}
      >
        <Text style={commonStyles.text}>Value</Text>
      </View>
    </View>
  )

  const getBackgroundColor = (user_id: string, i: number): string => {
    if (user_id === userData!.user_id) {
      return '#009dffff'
    } else if (data.friend_ids.includes(user_id)) {
      return '#00d519ff'
    }
    return i % 2 ? '#000000': '#222328ff'
  };

  const createScrollView = (leaderboard: LeaderboardListItem[]): JSX.Element => {
    return (
      <ScrollView
          style={{
            flex: 1,
            // marginBottom: 10,
          }}
        >
          {leaderboard.map((item, i) => {
            return (
              <View 
                key={i}
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'space-between',
                  padding: 5,
                  backgroundColor: getBackgroundColor(item.user_id, i),
                  borderRadius: 5,
                  alignSelf: 'center'
                }}
              >
                <Text style={commonStyles.text}>{item.rank}</Text>
                <View 
                  style={{
                    // width: '40%',
                    alignItems: 'center',
                    // backgroundColor: 'red',
                  }}
                >
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    // width: '35%',
                    alignItems: 'flex-end',
                    // backgroundColor: 'purple'
                  }}
                >
                  <Text style={commonStyles.text}>{item.value}</Text>
                </View>
              </View>
            )
          })}
      </ScrollView>
    )
  };

  if (!data.fracture) {
    return (
     <View 
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
      >
        {leaderboardHeaders}
        {createScrollView(data.leaderboard)}
    </View>
    )
  }

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        {leaderboardHeaders}
        {createScrollView(data.leaderboard.slice(0, showTopNum))}
      </View>
      <View 
        style={{
          height: 1,
          backgroundColor: 'white',
          width: '95%',
          alignSelf: 'center',
        }}
      />
      <View
        style={{
          flex: 1,
          marginBottom: 10,
        }}
      >
        {createScrollView(data.leaderboard.slice(showTopNum))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

})