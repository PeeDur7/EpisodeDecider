import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegistrationPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    //must check if each input field is filled and matches the requirements before reigstering user through firebase
    const registerUser = () => {
        navigation.navigate("Login");
    };

    return(
        <>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Create an Account</Text>
                <View style={styles.textContainer}>
                    <View style={{width : "100%"}}>
                        <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Username</Text>
                        <TextInput 
                            style={styles.username} 
                            onChangeText={setUsername} 
                            placeholder="Enter Username"
                            placeholderTextColor="white"
                            value={username}
                        />
                    </View>
                    <View style={{width : "100%"}}>
                        <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Email</Text>
                        <TextInput 
                            style={styles.email} 
                            onChangeText={setEmail} 
                            placeholder="Enter Email"
                            placeholderTextColor="white"
                            keyboardType="email-address"
                            value={email}
                        />
                    </View>
                    <View style={styles.passwordContainer}>
                        <View style={{width : "100%"}}>
                            <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Password</Text>
                            <TextInput 
                                style={styles.password} 
                                onChangeText={setPassword} 
                                placeholder="Enter Password"
                                placeholderTextColor="white"
                                secureTextEntry={!showPassword}
                                value={password}
                            />
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
                                onPress={() => setShowPassword(prev => !prev)}
                                >
                                <Checkbox
                                    value={showPassword}
                                    onValueChange={setShowPassword}
                                    style={{marginRight : 5}}
                                />
                                <Text style={{color : "white", fontWeight : "500"}}>Show Password</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.confirmPasswordContainer}>
                        <View style={{width : "100%"}}>
                            <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Confirm Password</Text>
                            <TextInput 
                                style={styles.confirmPassword} 
                                onChangeText={setConfirmPassword} 
                                placeholder="Confirm Password"
                                placeholderTextColor="white"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                            />
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
                                onPress={() => setShowConfirmPassword(prev => !prev)}
                                >
                                <Checkbox
                                    value={showConfirmPassword}
                                    onValueChange={setShowConfirmPassword}
                                    style={{marginRight : 5}}
                                />
                                <Text style={{color : "white", fontWeight : "500"}}>Show Password</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Pressable style={styles.signUpButton} onPress={registerUser}>
                        <Text style={styles.signUpButtonText}> Sign Up</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </>
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
        marginBottom: 15,
        marginTop : 20
    },
    textContainer : {
        marginTop : 30,
        alignItems : "center",
        padding: 20,
        width: "95%"
    },
    username : {
        color : "white",
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "100%",
        marginBottom: 30
    },
    email : {
        color : "white",
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "100%",
        marginBottom: 30
    },
    passwordContainer : {
        width: "100%",
        marginBottom: 30
    },
    password : {
        color : "white",
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "100%"
    },
    confirmPasswordContainer : {
        width: "100%",
        marginBottom: 20
    },
    confirmPassword : {
        color : "white",
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "100%"
    },
    signUpButton : {
        marginTop : 15,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center"
    },
    signUpButtonText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    }
});