import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SignInScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
      <Text style={{ color: "white"}}>Sign In</Text>
      <TouchableOpacity 
        onPress={() => router.replace("/sign-up")}
      >
        <Text style={{ color: "white"}}>don't have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}
