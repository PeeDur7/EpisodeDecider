import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ForgotPasswordPage(){
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    


    return(
        <SafeAreaView style={styles.container}>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {

    }
});