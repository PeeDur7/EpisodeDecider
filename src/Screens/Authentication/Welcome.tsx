import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";
import { useNavigation } from "@react-navigation/native";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomePage(){
    const navigation = useNavigation<NavigationProp>();
    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>
                Episode Roulette 
            </Text>
            <View style={styles.textContainer}>
                <Text style={styles.subHeading}>
                    Removes decision fatigue by randomly selecting an episode within your chosen season range and launching it directly on your streaming service</Text>
                <Pressable
                    onPress={() => navigation.navigate("Registration")}
                    style={styles.getStarted}
                >
                    <Text style={styles.getStartedText}>Let's get started</Text>
                </Pressable>
                <Pressable
                    onPress={() => navigation.navigate("Login")}
                    style={styles.alreadyHaveAnAccount}
                >
                    <Text style={styles.alreadyHaveAnAccountText}>I already have an account</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor : "#3A3A3C",
        flex : 1,
        alignItems : "center",
    },
    title : {
        fontSize : 30,
        color : "white",
        fontWeight : "600",
        marginTop : 225
    },
    textContainer : {
        marginTop : 0,
        alignItems : "center",
        padding: 20,
        width: "95%"
    },
    subHeading : {
        fontSize : 13,
        color : "#cdcfcf",
        fontWeight : "600",
        textAlign : "center",
        lineHeight : 20,
        marginBottom : 30
    },
    getStarted : {
        marginTop : 15,
        backgroundColor : "#6a6e6e",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center",
        paddingVertical : 10
    },
    getStartedText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    },
    alreadyHaveAnAccount : {
        marginTop : 15,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center",
        paddingVertical : 10
    },
    alreadyHaveAnAccountText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    }
});