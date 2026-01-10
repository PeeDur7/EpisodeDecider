import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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
    const [endIndex, setEndIndex] = useState(6);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user && user.uid) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const lowerName = userData.name.toLowerCase();
                    const titleName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
                    setName(titleName);
                    if (userData.recentlyWatchedShows) {
                        setRecentlyWatchedShows(new Set(userData.recentlyWatchedShows));
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [fetchUserData])
    );

    const loadMore = () => {
        if(endIndex + 5 > recentlyWatchedShows.size){
            setEndIndex(recentlyWatchedShows.size);
        } else {
            setEndIndex(prev => prev + 5);
        }
    };

    if(loading === true){
        return(
            <SafeAreaView style={[styles.container, {justifyContent : "center"}]}>
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
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.userName}>{name}!</Text>
                </View>
                
                <View style={styles.homeContainer}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="time-outline" size={22} color="#03AC13" />
                        <Text style={styles.showsWatchedSubHeading}>Recently Watched</Text>
                    </View>
                    
                    {recentlyWatchedShows.size === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="tv-outline" size={60} color="#555" />
                            <Text style={styles.emptyStateTitle}>No Shows Yet</Text>
                            <Text style={styles.emptyStateText}>
                                Start exploring and watching your favorite shows!
                            </Text>
                        </View>
                    )}
                    
                    {recentlyWatchedShows.size > 0 && (
                        <View style={styles.showsGrid}>
                            {Array.from(recentlyWatchedShows).slice(0,endIndex).map((show) => (
                                <Pressable
                                    key={show.id}
                                    onPress={() => navigation.navigate("ShowInfo", {
                                        showId : show.id,
                                        showPoster : show.poster, 
                                        showTitle : show.showTitle,
                                        firstAirDate : show.firstAirDate
                                    })}
                                    style={({pressed}) => [
                                        styles.showCard,
                                        pressed && { opacity : 0.7, transform: [{ scale: 0.98 }]}
                                    ]}
                                >
                                    <View style={styles.posterContainer}>
                                        <Image source={{uri : show.poster}} style={styles.showPoster}/>
                                    </View>
                                    <Text style={styles.showTitle} numberOfLines={2}>{show.showTitle}</Text>
                                    <Text style={styles.showYear}>{show.firstAirDate}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                    
                    {endIndex < recentlyWatchedShows.size && (
                        <Pressable
                            style={({pressed}) => [
                                styles.loadMoreButton,
                                pressed && { opacity : 0.8 }
                            ]}
                            onPress={loadMore}
                        >
                            <Text style={styles.loadMoreText}>Load more</Text>
                            <Ionicons name="chevron-down" size={18} color="white" />
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
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title : {
        fontSize : 20,
        color : "#AEAEB2",
        fontWeight : "400",
    },
    userName: {
        fontSize : 32,
        color : "white",
        fontWeight : "700",
        marginTop: 2,
    },
    homeContainer : {
        marginTop : 10,
        alignItems : "center",
        padding: 15,
        width: "100%",
        paddingBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        gap: 8,
    },
    showsWatchedSubHeading : {
        fontSize : 22,
        color : "white",
        fontWeight : "600",
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        width: '100%',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#AEAEB2',
        marginTop: 20,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6C6C70',
        textAlign: 'center',
        marginTop: 8,
        maxWidth: '80%',
    },
    showsGrid : {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 15,
    },
    showCard: {
        width: '47%',
        marginBottom: 10,
    },
    posterContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#1C1C1E',
    },
    showPoster : {
        width: '100%',
        aspectRatio: 2/3,
    },
    showTitle : {
        color : "white",
        fontSize : 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    showYear: {
        color: '#AEAEB2',
        fontSize: 13,
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
        marginTop : 20,
        backgroundColor : "#03AC13",        
        borderRadius : 10,
        width: "100%",
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
    },
    loadMoreText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
    }
});