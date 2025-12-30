import { getAuth, signOut } from "@firebase/auth";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function logoutButton(){
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    const logOutUser = async () => {
        setLoading(true);
        await signOut(auth);
    };

    return(
        <SafeAreaView>

        </SafeAreaView>
    );
}