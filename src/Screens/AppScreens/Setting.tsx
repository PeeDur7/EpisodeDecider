import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../../Components/LogoutButton";

export default function SettingPage(){
    const [username, setUsername] = useState("");
    const [preferedStreamingServices, setPreferedStreamingServices] = useState(""); //set of prefered streaming services

    //all of the streaming services this app will create deep links for 
    const streamingServices = new Set([
        "Amazon Prime Video",
        "Amazon Prime Video with Ads",
        "Netflix",
        "Paramount Plus",
        "HBO Max",
        "Hulu",
        "YouTube TV",
        "Disney Plus"
    ]);

    return(
        <SafeAreaView style={styles.container} >
            <Text style={styles.title}>Settings</Text>
            <View style={styles.settingsContainer}>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor : "#3A3A3C",
        flex : 1,
        alignItems : "center"
    },
    title : {
        fontSize : 30,
        color : "white",
        fontWeight : "600",
        marginTop : 40
    },
    settingsContainer : {
        marginTop : 15,
        alignItems : "center",
        padding: 20,
        width: "95%"
    }
});