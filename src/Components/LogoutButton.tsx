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
            style={styles.logoutButton}
            onPress={logOutUser}
            disabled={loading}
        >
            <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    logoutButton : {

    },
    logoutButtonText : {

    }
});