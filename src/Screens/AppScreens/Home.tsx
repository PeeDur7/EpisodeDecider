import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
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
    const [name, setName] = useState("");
    const [recentlyWatchedShows, setRecentlyWatchedShows] = useState<Set<userWatchedShows>>(new Set());
    const [endIndex, setEndIndex] = useState(5);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();


    useEffect(() => {
        const user = auth.currentUser;
        if(user && user.uid){
            getDoc(doc(db,"users",user.uid)).then(userDoc => {
                if(userDoc.exists()){
                    const lowerName = userDoc.data().name.toLowerCase();
                    const titleName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
                    setName(titleName);
                    if(userDoc.data().recentlyWatchedShows){
                        setRecentlyWatchedShows(new Set(userDoc.data().recentlyWatchedShows));
                    }
                }
            });
        }
        setLoading(false);
    }, []);

    if(loading === true){
        return(
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#03AC13" />
                    <Text style={styles.loadingText}>Loading page</Text>
                </View>
            </SafeAreaView>
        );
    }

    return(
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Welcome Back {name}!</Text>
                <View style={styles.homeContainer}>
                    <Text style={[styles.showsWatchedSubHeading, {marginBottom : recentlyWatchedShows.size > 0 ? 10 : 0}]}>Recently Watched Shows</Text>
                    {recentlyWatchedShows.size === 0 && (
                        <Text style={styles.noShowsWatchedText}>No shows were recently watched.{"\n"}Start searching your favorite shows!</Text>
                    )}
                    {recentlyWatchedShows.size > 0 && (
                        <View style={styles.showsGrid}>
                            {Array.from(recentlyWatchedShows).slice(0,endIndex).map((show) => (
                                <View key={show.id} style={styles.recentWatchedShowContainer}>
                                    <Text style={styles.showTitle} numberOfLines={2}>{show.showTitle}</Text> 
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowInfo", {
                                            showId : show.id,
                                            showPoster : show.poster, 
                                            showTitle : show.showTitle,
                                            firstAirDate : show.firstAirDate
                                        })}
                                        style={({pressed}) => [
                                            pressed && { opacity : 0.6},
                                            styles.showButton
                                        ]}
                                    >
                                        <Image source={{uri : show.poster}} style={styles.showPoster}/>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                    {endIndex < recentlyWatchedShows.size && (
                        <Pressable
                            style={({pressed}) => [
                                styles.loadMoreButton,
                                pressed && { opacity : 0.6}
                            ]}
                            onPress={() => setEndIndex(recentlyWatchedShows.size)}
                        >
                            <Text style={styles.loadMoreText}>Load more</Text>
                        </Pressable>
                    )}
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
        fontSize : 28,
        color : "white",
        fontWeight : "600",
        marginTop : 20,
        marginHorizontal : 10
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
        textAlign : "center",
        width : "100%",
        textDecorationLine : "underline",
        textDecorationColor : "#cdcfcf",
    },
    noShowsWatchedText : {
        marginTop : 5,
        color: "#AEAEB2",
        fontSize: 14,
        fontStyle: "italic",
        marginLeft : 10
    },
    showsGrid : {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    recentWatchedShowContainer : {
        width : "48%",
        marginBottom: 20,
    },
    showTitle : {
        color : "white",
        fontSize : 16,
        marginBottom : 8,
        fontWeight: "500",
        textAlign: "center",
    },
    showButton : {
        width: '100%',
        alignItems: 'center',
    },
    showPoster : {
        width: '100%',
        aspectRatio: 2/3,
        borderRadius: 8,
    },
    loadingContainer: {
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    loadingText: {
        color: '#AEAEB2',
        fontSize: 14,
    },
    loadMoreButton : {
        marginTop : 10,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%",
        alignItems: "center"
    },
    loadMoreText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    }
});