import { signOut } from "@firebase/auth";
import { auth } from "../Firebase/FirebaseConfig";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function LogoutButton(){
    const [loading, setLoading] = useState(false);

    const logOutUser = async () => {
        setLoading(true);
        try{
            await signOut(auth);
        } catch (error) {
            console.error("error logging out ",error);
        } finally {
            setLoading(false);
        }
    };

    return(
        <Pressable 
            style={({pressed}) => [
                styles.logoutButton,
                pressed && { opacity : 0.6 }
            ]}
            onPress={logOutUser}
            disabled={loading}
        >
            <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    logoutButton : {
        marginTop : 25,
        backgroundColor : "red",        
        borderRadius : 5,
        width: "100%",
        alignItems: "center",
        paddingVertical: 12,
    },
    logoutButtonText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
    }
});