import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
            <View style={styles.container}>
                <Text style={styles.title}>Create an Account</Text>
                <View style={styles.textContainer}>
                    <TextInput 
                        style={styles.username} 
                        onChangeText={setUsername} 
                        placeholder="Enter Username"
                        value={username}
                    />
                    <TextInput 
                        style={styles.email} 
                        onChangeText={setEmail} 
                        placeholder="Enter Email"
                        keyboardType="email-address"
                        value={email}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput 
                            style={styles.password} 
                            onChangeText={setPassword} 
                            placeholder="Enter Password"
                            secureTextEntry={!showPassword}
                            value={password}
                        />
                        <Pressable
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => setShowPassword(prev => !prev)}
                            >
                            <Checkbox
                                value={showPassword}
                                onValueChange={setShowPassword}
                            />
                            <Text>Show Password</Text>
                        </Pressable>
                    </View>
                    <View style={styles.confirmPasswordContainer}>
                        <TextInput 
                            style={styles.confirmPassword} 
                            onChangeText={setConfirmPassword} 
                            placeholder="Confirm Password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                        />
                        <Pressable
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => setShowConfirmPassword(prev => !prev)}
                            >
                            <Checkbox
                                value={showConfirmPassword}
                                onValueChange={setShowConfirmPassword}
                            />
                            <Text>Show Password</Text>
                        </Pressable>
                    </View>
                </View>
                <Button title="Sign Up" onPress={registerUser}/>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    title : {

    },
    container : {

    },
    textContainer : {

    },
    username : {

    },
    email : {

    },
    passwordContainer : {

    },
    password : {

    },
    confirmPasswordContainer : {

    },
    confirmPassword : {

    }
});