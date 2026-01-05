import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { RootStackParamList } from "../../Navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import Constants from "expo-constants";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ShowResult {
    id: number;
    name: string;
    popularity: number;
    posterImage? : string;
    first_air_date : string;
}

interface recentlyWatchedEpisodes {
    show : string,
    name : string,
    num : string,
    season : string;
}

export default function SearchPage(){
    const [recentlyWatchedEP, setRecentlyWatchedEP] = useState<recentlyWatchedEpisodes[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedShows, setSearchedShows] = useState<ShowResult[]>([]); //return top 3 shows that the api finds using searchText
    //these 2 variables are for pagination of the recently watched shows
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(5);

    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        const user = auth.currentUser;
        if(user && user.uid){
            getDoc(doc(db,"users",user.uid)).then(userDoc => {
                if(userDoc.exists() && userDoc.data().recentlyWatchedEP){
                    //going to need to change once i implement recenetly watched episodes
                    setRecentlyWatchedEP(userDoc.data().recentlyWatchedEP); 
                }
            });
        }
        setLoading(false);
    },[]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchText.trim() !== "") {
                performSearch(searchText);
            } else {
                setSearchedShows([]);
            }
        }, 500); // Wait 500ms after user stops typing
    
        return () => clearTimeout(delaySearch);
    }, [searchText]);

    const performSearch = async(text : string) => {
        if(text.trim() === "") {
            setSearchedShows([]);
            return;
        }

        try{
            const tmdbSearchAPI = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}&query=${encodeURIComponent(text)}`);
            const tmdbData = await tmdbSearchAPI.json();
            if(tmdbData.total_results > 0){
                const sortedList = tmdbData.results.sort((a : ShowResult,b : ShowResult) => b.popularity - a.popularity);
                const listLength = Math.min(5, sortedList.length);
                const topThree = sortedList.slice(0,listLength);
                const topThreeWithPosters = await Promise.all(
                    topThree.map(async (show : ShowResult) => {
                        try{
                            const tvmazeAPI = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(show.name)}`);
                            const tvmazeData = await tvmazeAPI.json();
                            if(tvmazeData.length > 0 && tvmazeData[0].show?.image?.medium){
                                return{
                                    ...show,
                                    posterImage : tvmazeData[0].show.image.medium
                                }
                            } else{
                                return {
                                    ...show,
                                    posterImage : undefined
                                }
                            }
                        }catch(error){
                            console.error(`Error fetching poster for ${show.name}:`, error);
                            return {
                                ...show,
                                posterImage: undefined
                            };
                        }
                    })
                )
                setSearchedShows(topThreeWithPosters);
            } else {
                setSearchedShows([]);
            }
        }catch(error){
            setSearchedShows([]);
        }
    };

    const changeSearchText = (text : string) => {
        setSearchText(text);
    };

    const pagination = () => {
        if(endIndex + 5 > recentlyWatchedEP.length){
            setStartIndex(endIndex);
            setEndIndex(recentlyWatchedEP.length);
        } else {
            setStartIndex(prev => prev + 5);
            setEndIndex(prev => prev + 5);
        } 
    };

    if(loading === true){
        return(
            <SafeAreaView style={styles.container}/>
        );
    }

    return(
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>
                <View style={styles.searchPageContainer}>
                    <View style={styles.searchContainer}>
                        <Pressable
                            onPress={() => navigation.navigate("ShowList",{
                                showTitle : searchText
                            })}
                        >
                            <Ionicons name="search-outline" size={15} color="white" style={{marginRight : 8}}/>
                        </Pressable>
                        <TextInput
                            placeholder="Search your favorite shows"
                            placeholderTextColor={"white"}
                            onChangeText={changeSearchText}
                            value={searchText}
                            autoCapitalize="none"
                            style={styles.searchText}
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                if(searchText.trim() !== "") {
                                    navigation.navigate("ShowList", {
                                        showTitle: searchText
                                    });
                                }
                            }}
                        />
                    </View>
                    {searchedShows.length > 0 && (
                        <View style={styles.searchDropdownShowsContainer}>
                            {Array.from(searchedShows).map((show,index) => (
                                <Pressable
                                    key={show.id}
                                    onPress={() => navigation.navigate("ShowInfo",{
                                        showId : show.id
                                    })}
                                    style={styles.searchDropdownButton}
                                >
                                    {show.posterImage ? (
                                        <Image 
                                            source={{uri : show.posterImage}} 
                                            style={styles.poster}
                                        />
                                    ) : (
                                        <View style={[styles.poster, {backgroundColor: '#555'}]} />
                                    )}
                                    <Text style={styles.searchDropdownText}>{show.name}</Text>
                                    <Text style={styles.searchAirDate}>{show.first_air_date.slice(0,4)}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                    
                    <View style={styles.recentlyWatchedEpisodesContainer}>
                        <Text style={styles.recentlyWatchedEpisodesSubHeading}>Recently Watched Episodes</Text>
                        {recentlyWatchedEP.length === 0 && (
                            <Text style={styles.noRecentWatchedEPText}>No episodes watched recently. Start searching!</Text>
                        )}
                        {recentlyWatchedEP.length > 0 && (
                            Array.from(recentlyWatchedEP)
                            .slice(startIndex,endIndex)
                            .map((episode, index) => (
                                //may need to change some of these data points since i havent implemented them yet
                                <Pressable
                                    key={index}
                                    style={styles.recentlyWatchedEpisodes}
                                    onPress={() => navigation.navigate("ShowRedirect", {
                                        showTitle : episode.name,
                                        episodeNum : episode.num,
                                        seasonNum : episode.season
                                    })}
                                >
                                    <Text style={styles.showTitle}>{episode.show}</Text>
                                    <Text style={styles.episode}>{episode.name}</Text>
                                </Pressable>
                            ))
                        )}
                    </View>
                    { endIndex < recentlyWatchedEP.length && (
                        <Pressable
                            onPress={pagination}
                            style={styles.loadMore}
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
    searchPageContainer : {
        flexDirection : "column",
        alignItems : "center",
        width : "100%"
    },
    searchContainer : {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C1C1E",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginTop: 10,
        width : "92%"
    },
    searchText : {
        color: "white",
        fontSize: 16,
    },
    searchAirDate : {
        color : "#8E8E93",
        fontSize : 14,
        fontStyle : "italic"
    },
    showTitle : {

    }, 
    episode : {

    },
    recentlyWatchedEpisodesContainer : {
        marginTop : 20
    },
    recentlyWatchedEpisodes : {

    },
    loadMore : {
        marginTop : 15,
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
    },
    noRecentWatchedEPText : {
        color: "#8E8E93",
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 5,
        width: "100%",
        marginLeft : 10
    },
    recentlyWatchedEpisodesSubHeading : {
        fontSize : 20,
        color : "white",
        fontWeight : "500",
        textAlign : "left",
        width : "100%",
        textDecorationLine : "underline",
        textDecorationColor : "#cdcfcf"
    },
    searchDropdownShowsContainer : {
        width: "92%",
        backgroundColor: '#1C1C1E',
        borderRadius: 8,
        marginTop: 10,
        padding: 10,
    },
    searchDropdownButton : {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 3,
        borderBottomColor: '#3A3A3C',
        width : "95%"
    }, 
    searchDropdownText : {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    poster : {
        width: 40,    
        height: 60,     
        borderRadius: 4,
        marginRight: 10,
    }
});