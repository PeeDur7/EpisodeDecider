import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../Firebase/FirebaseConfig";
import { Ionicons } from '@expo/vector-icons';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegistrationPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const navigation = useNavigation<NavigationProp>();

    const handleUsernameChange = (text: string) => {
        setUsername(text);
        setUsernameError("");
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setEmailError("");
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordError("");
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        setConfirmPasswordError("");
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

    //only valid if password is longer than 6 characters and has atleast one capital character
    const isPasswordValid = () => {
        if (!password) {
            setPasswordError("Password is required");
            return false;
        }
        if(password.length < 6){
            setPasswordError("Password needs to be at least 6 characters");
            return false;
        }
        if(!/[A-Z]/.test(password)){
            setPasswordError("Password is missing a capital character");
            return false;
        }
        if(!confirmPassword || password !== confirmPassword){
            setConfirmPasswordError("Passwords do not match");
            return false;
        }
        return true;
    };

    //checks if username is not in database if so we can register user
    const isUsernameValid = async (): Promise<boolean> => {
        if (!username.trim()) {
            setUsernameError("Username is required");
            return false;
        }
        try {
            const userRef = collection(db,"users");
            const q = query(userRef, where("usernameLowerCase","==",username.toLowerCase()));
            const querySnapShot = await getDocs(q);
            if(!querySnapShot.empty){
                setUsernameError("Username is already taken");
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    };

    //must check if each input field is filled and matches the requirements before reigstering user through firebase
    const registerUser = async () => {
        setLoading(true);
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        if (!isEmailValid() || !isPasswordValid()){
            setLoading(false);
            return ;
        } 

        try{
            const usernameValid = await isUsernameValid();
            if(!usernameValid) return;
            const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
            const user = userCredentials.user;
            await setDoc(doc(db,"users",user.uid), {
                username : username,
                usernameLowerCase : username.toLowerCase(),
                email : email,
                uid : user.uid,
                createdAt : new Date().toISOString()
            });
            navigation.navigate("Login");
        } catch (error : any) {
            if (error.code === "auth/email-already-in-use") {
                setEmailError("This email is already registered");
            } else if (error.code === "auth/invalid-email") {
                setEmailError("Invalid email address");
            } else if (error.code === "auth/weak-password") {
                setPasswordError("Password is too weak");
            }
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return(
        <>
            <SafeAreaView style={styles.container}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={25} color="white"/>
                </Pressable>
                <Text style={styles.title}>Create an Account</Text>
                <View style={styles.textContainer}>
                    <View style={{width : "100%"}}>
                        <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Username</Text>
                        <TextInput 
                            style={usernameError ? styles.errorStyle : styles.username} 
                            onChangeText={handleUsernameChange} 
                            placeholder="Enter Username"
                            placeholderTextColor="white"
                            value={username}
                            autoCapitalize="none"
                        />
                        {usernameError ? (
                            <Text style={styles.errorText}>{usernameError}</Text>
                        ) : null}
                    </View>
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
                    <View style={styles.passwordContainer}>
                        <View style={{width : "100%"}}>
                            <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Password</Text>
                            <TextInput 
                                style={passwordError ? styles.errorStyle : styles.password} 
                                onChangeText={handlePasswordChange} 
                                placeholder="Enter Password"
                                placeholderTextColor="white"
                                secureTextEntry={!showPassword}
                                value={password}
                            />
                            {passwordError ? (
                                <Text style={styles.errorText}>{passwordError}</Text>
                            ) : null}
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginLeft : 5 }}
                                onPress={() => setShowPassword(prev => !prev)}
                                >
                                <Checkbox
                                    value={showPassword}
                                    onValueChange={setShowPassword}
                                    style={{marginRight : 5, borderRadius : 5}}
                                />
                                <Text style={{color : "white", fontWeight : "500"}}>Show Password</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.confirmPasswordContainer}>
                        <View style={{width : "100%"}}>
                            <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Confirm Password</Text>
                            <TextInput 
                                style={confirmPasswordError ? styles.errorStyle : styles.confirmPassword} 
                                onChangeText={handleConfirmPasswordChange} 
                                placeholder="Confirm Password"
                                placeholderTextColor="white"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                            />
                            {confirmPasswordError ? (
                                <Text style={styles.errorText}>{confirmPasswordError}</Text>
                            ) : null}
                            <Pressable
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginLeft : 5 }}
                                onPress={() => setShowConfirmPassword(prev => !prev)}
                                >
                                <Checkbox
                                    value={showConfirmPassword}
                                    onValueChange={setShowConfirmPassword}
                                    style={{marginRight : 5, borderRadius : 5}}
                                />
                                <Text style={{color : "white", fontWeight : "500"}}>Show Password</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Pressable style={styles.signUpButton} onPress={registerUser} disabled={loading}>
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
    backButton : {
        position: "absolute",
        top: 50,
        left: 10,
        zIndex: 10,
        padding: 10
    },
    title : {
        fontSize : 30,
        color : "white",
        fontWeight : "600",
        marginTop : 20
    },
    textContainer : {
        marginTop : 15,
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
    },
    errorText : {
        color: "#FF6666",
        fontSize: 12,
        marginLeft: 5,
        marginBottom: 20,
        marginTop: 2
    },
    errorStyle : {
        color : "white",  
        fontWeight : "500",
        borderWidth: 2,
        borderColor: "#FF4444",  
        borderRadius: 8,
        padding: 12,
        width: "100%"
    }
});