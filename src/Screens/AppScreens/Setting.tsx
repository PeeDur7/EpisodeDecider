import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../../Components/LogoutButton";

export default function SettingPage(){
    const [username, setUsername] = useState("");
    const [preferedStreamingServices, setPreferedStreamingServices] = useState(""); //set of prefered streaming services
    //will have to add the specifc streaming services that are labeled in the TMDB API
    const streamingServices = new Set([

    ]);

    return(
        <SafeAreaView style={styles.container}>
            <View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor : "#3A3A3C",
        flex : 1,
        alignItems : "center"
    }
});