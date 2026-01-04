import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../../Components/LogoutButton";
import { db, loadUserFromStorage } from "../../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingPage(){
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [preferredStreamingServices, setPreferredStreamingServices] = useState<Set<string>>(new Set());

    //all of the streaming services this app will create deep links for 
    const streamingServices = [
        "Amazon Prime Video",
        "Netflix",
        "Paramount Plus",
        "HBO Max",
        "Hulu",
        "YouTube TV",
        "Disney Plus"
    ];

    const addService = async (service : string) => {
        setPreferredStreamingServices(prev => 
            new Set(prev).add(service)
        );

        if(userId){
            try{
                await updateDoc(doc(db,"users",userId), {
                    preferredStreamingServices : Array.from(preferredStreamingServices)
                });
            } catch(error) {
                throw error;
            }
        }
    };

    const removeService = async (service : string) => {
        const newSet = new Set(preferredStreamingServices);
        newSet.delete(service);
        setPreferredStreamingServices(newSet);
        
        if(userId){
            try{
                await updateDoc(doc(db, "users", userId), {
                    preferredStreamingServices : Array.from(newSet)
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
                        setPreferredStreamingServices(new Set(userDoc.data().preferredStreamingService));
                    }
                }
            }
        })
    },[]);

    return(
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container} >
                <Text style={styles.title}>Settings</Text>
                <View style={styles.settingsContainer}>
                    <Text style={styles.preferredStreamingServicesSubHeading}>Preferred Streaming Services</Text>
                    {preferredStreamingServices.size === 0 && (
                        <Text style={styles.noStreamingService}>No streaming services selected</Text>
                    )}
                    {
                        Array.from(preferredStreamingServices).map((service, index) => (
                            <Pressable
                                key={index}
                                onPress={() => removeService(service)}
                                style={({pressed}) => [
                                    styles.preferredStreamingServicesButton,
                                    pressed && { opacity: 0.6 }
                                ]}
                            >
                                <Ionicons name="close-outline" size={30} color={"red"}/>
                                <Text style={styles.preferredStreamingServicesText}>{service}</Text>
                            </Pressable>
                        ))
                    }
                    <Text style={styles.streamingServicesSubHeading}>Add Prefered Streaming Services</Text>
                    {streamingServices.length === preferredStreamingServices.size && (
                        <Text style={styles.noStreamingService}>All streaming services have been selected</Text>
                    )}
                    {
                        streamingServices
                            .filter(service => !preferredStreamingServices.has(service))
                            .map((service,index) => (
                            <Pressable
                                key={index}
                                onPress={() => addService(service)}
                                style={({pressed}) => [
                                    styles.streamingServicesButton,
                                    pressed && { opacity : 0.6 }
                                ]}
                            >
                                <Ionicons name="add-outline" size={30} color={"#03AC13"}/>
                                <Text style={styles.streamingServiceText}>{service}</Text>
                            </Pressable>
                        ))
                    }
                    <LogoutButton/>
                </View>
            </SafeAreaView>
        </ScrollView>
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
        marginTop : 20
    },
    settingsContainer : {
        marginTop : 15,
        alignItems : "center",
        padding: 15,
        width: "95%"
    },
    preferredStreamingServicesSubHeading : {
        fontSize : 20,
        color : "white",
        fontWeight : "500",
        textAlign : "left",
        width : "100%",
        textDecorationLine : "underline",
        textDecorationColor : "#cdcfcf",
    },
    preferredStreamingServicesButton : {
        width : "100%",
        flexDirection : "row",
        alignItems : "center",
        paddingVertical: 5,
        paddingHorizontal: 5, 
        marginRight : 5,
        marginTop : 10,
        borderWidth : 1,
        borderRadius : 5,
        borderColor : "#cdcfcf",
    },
    preferredStreamingServicesText : {
        color : "white",
        fontWeight : "500",
        marginLeft : 5
    },
    streamingServicesSubHeading : {
        fontSize : 20,
        color : "white",
        fontWeight : "500",
        marginTop : 40,
        textAlign : "left",
        width : "100%",
        textDecorationLine : "underline",
        textDecorationColor : "#cdcfcf"
    },
    streamingServicesButton : {
        width : "100%",
        flexDirection : "row",
        alignItems : "center",
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginRight : 5,
        marginTop : 10,
        borderWidth : 1,
        borderRadius : 5,
        borderColor : "#cdcfcf",
    },
    streamingServiceText : {
        color : "white",
        fontWeight : "500",
        marginLeft : 5
    },
    noStreamingService : {
        color: "#8E8E93",
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 5,
        width: "100%",
        marginLeft : 10
    }
});