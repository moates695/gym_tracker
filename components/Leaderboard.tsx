import { LeaderboardData } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { Text, View, StyleSheet, ScrollView } from 'react-native';

export interface LeaderboardProps {
  data: LeaderboardData | null
}

export function Leaderboard(props: LeaderboardProps) {
  // const {data} = props;

  // if (data === null) {
  //   console.log('here113');
  //   return (
  //     <Text style={commonStyles.text}>
  //       no leaderboard data
  //     </Text>
  //   )
  // }

  const data: LeaderboardData = {
    fracture: null,
    leaderboard: []
  };
  const testLength = 50;
  for (let i = 0; i < testLength; i++) {
    data.leaderboard.push({
      username: 'testtesttest',
      rank: i + 1,
      value: testLength - i
    })
  }

  // todo extract row building to a function
  // todo highlight user and friends in list?

  if (!data.fracture) {
    return (
     <View 
        style={{
          flex: 1,
          backgroundColor: 'black',
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
        <ScrollView
          style={{
            flex: 1,
            marginBottom: 10,
          }}
        >
          {data.leaderboard.map((item, i) => {
            return (
              <View 
                key={i}
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'space-between',
                  padding: 5,
                  backgroundColor: i % 2 ? '#000000': '#222328ff',
                  borderRadius: 5,
                  alignSelf: 'center'
                }}
              >
                <Text style={commonStyles.text}>{item.rank}</Text>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'center'
                  }}
                >
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={commonStyles.text}>{item.value}</Text>
                </View>
              </View>
            )
          })}
      </ScrollView>
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
        <ScrollView
          style={{
            flex: 1,
            // marginBottom: 10,
            // height: '50%'
          }}
        >
          {data.leaderboard.slice(0, data.fracture).map((item, i) => {
            return (
              <View 
                key={i}
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'space-between',
                  padding: 5,
                  backgroundColor: i % 2 ? '#000000': '#222328ff',
                  borderRadius: 5,
                  alignSelf: 'center'
                }}
              >
                <Text style={commonStyles.text}>{item.rank}</Text>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'center'
                  }}
                >
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={commonStyles.text}>{item.value}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
      <View 
        style={{
          height: 2,
          backgroundColor: 'white',
          width: '95%',
          alignSelf: 'center',
        }}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            marginBottom: 10,
            // height: '50%'
          }}
        >
          {data.leaderboard.slice(data.fracture).map((item, i) => {
            return (
              <View 
                key={i}
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'space-between',
                  padding: 5,
                  backgroundColor: i % 2 ? '#000000': '#222328ff',
                  borderRadius: 5,
                  alignSelf: 'center'
                }}
              >
                <Text style={commonStyles.text}>{item.rank}</Text>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'center'
                  }}
                >
                  <Text style={commonStyles.text}>{item.username}</Text>
                </View>
                <View 
                  style={{
                    width: '30%',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={commonStyles.text}>{item.value}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
      
    </View>
  )
}

const styles = StyleSheet.create({

})