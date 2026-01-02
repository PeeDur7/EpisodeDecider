import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../../Components/LogoutButton";
import { db, loadUserFromStorage } from "../../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function SettingPage(){
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [preferedStreamingServices, setPreferedStreamingServices] = useState<Set<string>>(new Set());

    //all of the streaming services this app will create deep links for 
    const streamingServices = [
        "Amazon Prime Video",
        "Amazon Prime Video with Ads",
        "Netflix",
        "Paramount Plus",
        "HBO Max",
        "Hulu",
        "YouTube TV",
        "Disney Plus"
    ];

    const addService = async (service : string) => {
        setPreferedStreamingServices(prev => 
            new Set(prev).add(service)
        );

        if(userId){
            try{
                await updateDoc(doc(db,"users",userId), {
                    preferedStreamingServices : Array.from(preferedStreamingServices)
                });
            } catch(error) {
                throw error;
            }
        }
    };

    const removeService = async (service : string) => {
        setPreferedStreamingServices(prev => {
            const newSet = new Set(prev);
            newSet.delete(service);
            return newSet;
        })
        
        if(userId){
            try{
                await updateDoc(doc(db, "users", userId), {
                    preferedStreamingServices : Array.from(preferedStreamingServices)
                })
            }catch(error){
                throw error;
            }
        }
    };

    //try to get the user's name
    useEffect(() => {
        loadUserFromStorage().then(async user => {
            if(user && user.uid){
                setUserId(user.uid);
                const userDoc = await getDoc(doc(db,"users",user.uid));
                if(userDoc.exists()){
                    setName(userDoc.data().name);
                    if(userDoc.data().preferedStreamingService){
                        setPreferedStreamingServices(new Set(userDoc.data().preferedStreamingService));
                    }
                }
            }
        })
    },[]);

    return(
        <SafeAreaView style={styles.container} >
            <Text style={styles.title}>Settings</Text>
            <View style={styles.settingsContainer}>
                <Text style={styles.preferedStreamingServicesSubHeading}>Prefered Streaming Services</Text>
                {
                    Array.from(preferedStreamingServices).map((service, index) => (
                        <Pressable
                            key={index}
                            onPress={() => removeService(service)}
                            style={styles.preferedStreamingServicesButton}
                        >
                            <Ionicons name="close-outline" size={12} color={"red"}/>
                            <Text style={styles.preferedStreamingServicesText}>{service}</Text>
                        </Pressable>
                    ))
                }
                <Text style={styles.streamingServicesSubHeading}>Add Prefered Streaming Services</Text>
                {
                    streamingServices.map((service,index) => (
                        <Pressable
                            key={index}
                            onPress={() => addService(service)}
                            style={styles.streamingServicesButton}
                        >
                            <Ionicons name="add-outline" size={12} color={"red"}/>
                            <Text style={styles.streamingServiceText}>{service}</Text>
                        </Pressable>
                    ))
                }
                <LogoutButton/>
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
    title : {
        fontSize : 30,
        color : "white",
        fontWeight : "600",
        marginTop : 40
    },
    settingsContainer : {
        marginTop : 15,
        alignItems : "center",
        padding: 20,
        width: "95%"
    },
    preferedStreamingServicesSubHeading : {

    },
    preferedStreamingServicesButton : {

    },
    preferedStreamingServicesText : {

    },
    streamingServicesSubHeading : {

    },
    streamingServicesButton : {

    },
    streamingServiceText : {

    }
});