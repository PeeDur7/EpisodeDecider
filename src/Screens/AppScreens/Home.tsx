import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";
import { useNavigation } from "@react-navigation/native";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface userWatchedShows {
    id : number,
    showTitle : string;
    poster? : string;
    firstAirDate : string;
}

export default function HomePage(){
    const [tempName, setTempName] = useState("");
    const [name, setName] = useState("");
    const [recentlyWatchedShows, setRecentlyWatchedShows] = useState<Set<userWatchedShows>>(new Set());
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();


    useEffect(() => {
        const user = auth.currentUser;
        if(user && user.uid){
            getDoc(doc(db,"users",user.uid)).then(userDoc => {
                if(userDoc.exists()){
                    setTempName(userDoc.data().name);
                    if(userDoc.data().recentlyWatchedShows){
                        //may need to change recentlyWatchedShows once i implement this feature
                        setRecentlyWatchedShows(new Set(userDoc.data().recentlyWatchedShows));
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        const lowerName = tempName.toLowerCase();
        const titleName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
        setName(titleName);
        setLoading(false);
    },[tempName]);

    if(loading === true){
        return(
            <SafeAreaView style={styles.container}/>
        );
    }

    return(
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Hello {name}</Text>
                <View style={styles.homeContainer}>
                    <Text style={styles.showsWatchedSubHeading}>Recently Watched Shows</Text>
                    {recentlyWatchedShows.size === 0 && (
                        <Text style={styles.noShowsWatchedText}>No shows were recently watched.{"\n"}Start searching your favorite shows!</Text>
                    )}
                    {
                        Array.from(recentlyWatchedShows).map((show,index) => (
                            <>
                                <Text style={styles.showTitle}>{show.showTitle}</Text> 
                                <Pressable
                                    key={index}
                                    //dont know what show title is yet
                                    onPress={() => navigation.navigate("ShowInfo", {
                                        showId : show.id,
                                        showPoster : show.poster, 
                                        showTitle : show.showTitle,
                                        firstAirDate : show.firstAirDate
                                    })}
                                    style={styles.showPoster}
                                >
                                    {/* image of the poster will go here */}
                                </Pressable>
                            </>
                        ))
                    }
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
    homeContainer : {
        marginTop : 15,
        alignItems : "center",
        padding: 15,
        width: "95%"
    },
    showsWatchedSubHeading : {
        fontSize : 20,
        color : "white",
        fontWeight : "500",
        textAlign : "left",
        width : "100%",
        textDecorationLine : "underline",
        textDecorationColor : "#cdcfcf"
    },
    noShowsWatchedText : {
        color: "#AEAEB2",
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 5,
        width: "100%",
        marginLeft : 10
    },
    showTitle : {

    },
    showPoster : {

    }
});