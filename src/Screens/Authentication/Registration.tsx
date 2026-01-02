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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [nameError, setNameError] = useState("");
    const navigation = useNavigation<NavigationProp>();

    const handleUsernameChange = (text: string) => {
        setName(text);
        setNameError("");
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
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email.trim()){
            setEmailError("Email is required");
            return false;
        }
        if(!emailRegex.test(email)){
            setEmailError("Email is an invalid format");
            return false;
        }

        const [localPart, domain] = email.split('@');
    
        //extra validations for email before @
        if (domain) {
            const domainParts = domain.split('.');
            
            const tld = domainParts[domainParts.length - 1];
            if (!/^[a-zA-Z]{2,}$/.test(tld)) {
                setEmailError("Email domain is invalid");
                return false;
            }
            
            const domainName = domainParts[0];
            if (/^\d/.test(domainName)) {
                setEmailError("Email domain is invalid");
                return false;
            }
            
            if (domainParts.some((part, index) => {
                return index > 0 && /^\d+$/.test(part);
            })) {
                setEmailError("Email domain is invalid");
                return false;
            }
        }
        return true;
    };

    //only valid if password is longer than 6 characters and has atleast one capital character
    const isPasswordValid = () => {
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

    const isNameValid = () => {
        if(name.trim().length === 0){
            setNameError("Name is required");
            return false;
        }
        return true;
    }

    //must check if each input field is filled and matches the requirements before reigstering user through firebase
    const registerUser = async () => {
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setLoading(true);

        try{
            if (!isNameValid() || !isEmailValid() || !isPasswordValid()) return;
            const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
            const user = userCredentials.user;
            await setDoc(doc(db,"users",user.uid), {
                name : name,
                email : email.toLowerCase(),
                uid : user.uid,
                createdAt : new Date().toISOString()
            });
        } catch (error : any) {
            if (error.code === "auth/email-already-in-use") {
                setEmailError("This email is already registered");
            } else if (error.code === "auth/invalid-email") {
                setEmailError("Invalid email address");
            } else if (error.code === "auth/weak-password") {
                setPasswordError("Password is too weak");
            }
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
                        <Text style={{marginLeft : 3, color : "white", fontWeight : "500", marginBottom : 5}}>Name</Text>
                        <TextInput 
                            style={nameError ? styles.errorStyle : styles.username} 
                            onChangeText={handleUsernameChange} 
                            placeholder="Enter Name"
                            placeholderTextColor="white"
                            value={name}
                            autoCapitalize="none"
                        />
                        {nameError ? (
                            <Text style={styles.errorText}>{nameError}</Text>
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
                                <Text style={styles.errorTextForPassword}>{passwordError}</Text>
                            ) : null}
                            <Text style={styles.passwordRequirement}>Password must have at least 6 characters and have a capital character</Text>
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
                        <Text style={styles.signUpButtonText}>
                            {loading ? "Signing up... please wait" : "Sign Up"}
                        </Text>
                    </Pressable>
                    <View style={styles.loginLink}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Pressable onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginLinkText}>Sign in</Text>
                        </Pressable>
                    </View>
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
        marginTop : 80
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
    errorTextForPassword : {
        color: "#FF6666",
        fontSize: 12,
        marginLeft: 5,
        marginBottom: 5,
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
    },
    loginLink: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    loginText: {
        color: "white",
        fontSize: 15
    },
    loginLinkText: {
        color: "#42A5F5",
        fontWeight: "500",
        fontSize: 15
    },
    passwordRequirement : {
        fontSize : 11,
        color : "#cdcfcf",
        fontWeight : "500",
        lineHeight: 20,
        fontStyle : "italic",
        marginLeft : 5,
    }
});