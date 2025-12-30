import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Firebase/FirebaseConfig";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


export default function ForgotPasswordPage(){
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    const handleEmailChange = (text : string) => {
        setEmail(text);
        setEmailError("");
    };

    const isEmailValid = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!email.trim()){
            setEmailError("Email is required");
            return false;
        }
        if(!emailRegex.test(email)){
            setEmailError("Email is an invalid format");
            return false;
        }
        return true;
    };

    const passwordReset = async() => {
        setEmailError("");
        setLoading(true);
        if(!isEmailValid()) return;
        try{
            await sendPasswordResetEmail(auth,email);
            navigation.navigate("Login");
        } catch(error : any){
            if (error.code === "auth/too-many-requests") {
                setEmailError("Too many attempts. Try again later");
            } else {
                setEmailError("Failed to send reset email");
            }
        } finally {
            setLoading(false);
        }
    };

    return(
        <SafeAreaView style={styles.container}>
            <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={25} color={"white"}/>
            </Pressable>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
                Enter your email and we'll send you{'\n'}a link to reset your password
            </Text>
            <View style={styles.textContainer}>
                <View style={{width : "100%"}}>
                    <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Email</Text>
                    <TextInput 
                        style={emailError ? styles.errorStyle : styles.email} 
                        onChangeText={handleEmailChange} 
                        placeholder="Enter Email"
                        placeholderTextColor="white"
                        keyboardType="email-address"
                        value={email}
                        autoCapitalize="none"
                    />
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}
                </View>
                <Pressable
                    style={styles.resetButton}
                    onPress={passwordReset}
                    disabled={loading}
                >
                    <Text style={styles.resetButtonText}>
                        {loading ? "Sending Email" : "Send Email"}
                    </Text>
                </Pressable>
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
    backButton : {
        position: "absolute",
        top: 50,
        left: 10,
        zIndex: 10,
        padding: 10,
    },
    title : {
        fontSize : 30,
        color : "white",
        fontWeight : "600",
        marginTop : 200
    }, 
    subtitle : {
        fontSize : 14,
        color : "#949494",
        fontWeight : "500",
        marginTop : 20,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
        maxWidth: "80%",
        fontStyle : "italic"
    },
    textContainer : {
        marginTop : 0,
        alignItems : "center",
        padding: 20,
        width: "95%"
    },
    errorStyle : {
        color : "white",  
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "#FF4444",  
        borderRadius: 8,
        padding: 12,
        width: "100%"
    },
    email : {
        color : "white",
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "100%",
        marginBottom: 10
    },
    errorText : {
        color: "#FF6666",
        fontSize: 12,
        marginLeft: 5,
        marginBottom: 20,
        marginTop: 2
    },
    resetButton : {
        marginTop : 15,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center"
    },
    resetButtonText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    }
});