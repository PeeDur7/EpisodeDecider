import { useState } from "react";
import { StyleSheet, View, Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigation = useNavigation<NavigationProp>();
    
    const handleEmailChange = (text : string) => {
        setEmail(text);
        setEmailError("");
    };

    const handlePasswordChange = (text : string) => {
        setPassword(text);
        setPasswordError("");
    };

    const loginUser = async () => {
        setEmailError("");
        setPasswordError("");
        setLoading(true);

        if(!email.trim()){
            setEmailError("Email is required");
            return;
        }
        if(!password){
            setPasswordError("Password is required");
            return;
        }

        try{
            const userCredentials = await signInWithEmailAndPassword(auth, email,password);
        } catch(error : any){
            switch (error.code) {
                case "auth/invalid-email":
                    setEmailError("Invalid email address");
                    break;
                case "auth/user-disabled":
                    setEmailError("This account has been disabled");
                    break;
                case "auth/user-not-found":
                    setEmailError("No account found with this email");
                    break;
                case "auth/wrong-password":
                    setPasswordError("Incorrect password");
                    break;
                case "auth/invalid-credential":
                    setEmailError("Invalid email or password");
                    break;
                case "auth/too-many-requests":
                    setPasswordError("Too many failed attempts. Please try again later");
                    break;
                default:
                    setEmailError("An error occurred. Please try again");
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
                <Ionicons name="arrow-back" size={25} color="white"/>
            </Pressable>
            <Text style={styles.title}>
                Login
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
                <View style={styles.links}>
                    <Pressable
                        onPress={() => navigation.navigate("Registration")}
                    >
                        <Text style={styles.linksText}>Don't have an account?</Text>
                    </Pressable>
                    <Pressable 
                        onPress={() => navigation.navigate("ForgotPassword")}
                    >
                        <Text style={styles.linksText}>Forgot password?</Text>
                    </Pressable>
                </View>
                <Pressable
                    onPress={loginUser}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
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
        marginTop : 180
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
    errorText : {
        color: "#FF6666",
        fontSize: 12,
        marginLeft: 5,
        marginBottom: 20,
        marginTop: 2
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
        marginBottom: 15
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
    links : {
        flexDirection : "row",
    },
    linksText : {
        color : "#42A5F5",
        fontWeight : "500",
        paddingHorizontal : 25 ,
        fontSize : 15
    },
    loginButton : {
        marginTop : 30,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center"
    },
    loginButtonText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    }
});