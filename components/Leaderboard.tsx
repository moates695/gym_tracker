import { LeaderboardData, LeaderboardListItem, userDataAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Col, Grid, Row } from "react-native-easy-grid";

export interface LeaderboardProps {
  data: LeaderboardData | null
}

// todo fix leaderboard row spacing with different string lengths
// todo show large numbers as condensed

export function Leaderboard(props: LeaderboardProps) {
  let {data} = props;

  const userData = useAtomValue(userDataAtom);

  // const leaderboard = [];
  // for (let i = 0; i < 100; i++) {
  //   leaderboard.push({
  //     user_id: "",
  //     username: "username",
  //     rank: i,
  //     value: 0
  //   })
  // }

  // data = {
  //   fracture: 5,
  //   leaderboard: leaderboard,
  //   user_rank: 0,
  //   max_rank: 0,
  //   friend_ids: [],
  //   rank_data: [],
  // };

  if (data === null || data.leaderboard.length === 0) {
    return (
      <Text style={commonStyles.text}>
        leaderboard is empty
      </Text>
    )
  }

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
                    alignItems: 'center',
                  }}
                >
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    alignItems: 'flex-end',
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

  return (
    <View 
      style={{
        flex: 1,
        // backgroundColor: 'red',
      }}
    >
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <View 
            style={{
              width: 40,
            }}
          >
            <Text style={[commonStyles.text]}>Rank</Text>
          </View>
          <View >
            <Text style={commonStyles.text}>Username</Text>
          </View>
        </View>
        <View 
          style={{
            alignItems: 'flex-end',
          }}
        >
          <Text style={commonStyles.text}>Value</Text>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        {data.leaderboard.map((item, i) => {
          return (
            <React.Fragment key={i}>
              {i === data.fracture &&
                <View 
                  style={{
                    height: 1,
                    backgroundColor: 'white',
                    width: '95%',
                    alignSelf: 'center',
                  }}
                />
              }
              <View 
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                    }}
                  >
                    <Text style={commonStyles.text}>{item.rank}</Text>
                  </View>
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={commonStyles.text}>{item.value}</Text>
                </View>
              </View>
            </React.Fragment>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({

})