import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
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
    num : number,
    season : number;
    poster : string;
    showId : number;
    overview : string;
    runTime : number;
    showFirstAirDate : string
}

export default function SearchPage(){
    const [recentlyWatchedEP, setRecentlyWatchedEP] = useState<recentlyWatchedEpisodes[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedShows, setSearchedShows] = useState<ShowResult[]>([]); 
    //pagination
    const [endIndexForSearch, setEndIndexForSearch] = useState(5); 
    const [endIndexForRecent, setEndIndexForRecent] = useState(5); //this is for recentlyWatchedEP

    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
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
                setHasSearched(false);
            }
        }, 500);
    
        return () => clearTimeout(delaySearch);
    }, [searchText]);

    const performSearch = async(text : string) => {
        setEndIndexForSearch(5);
        if(text.trim() === "") {
            setTotalResults(0);
            setSearchedShows([]);
            return;
        }

        setSearchLoading(true);

        try{
            const tmdbSearchAPI = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}&query=${encodeURIComponent(text)}`);
            const tmdbData = await tmdbSearchAPI.json();
            if(tmdbData.total_results > 0){
                setTotalResults(tmdbData.results.length);
                const sortedList = tmdbData.results.sort((a : ShowResult,b : ShowResult) => b.popularity - a.popularity);
                const sortedListWithPosters = await Promise.all(
                    sortedList.map(async (show : ShowResult) => {
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
                setSearchedShows(sortedListWithPosters);
            } else {
                setSearchedShows([]);
            }
            setHasSearched(true);
        }catch(error){
            setSearchedShows([]);
            setHasSearched(false);
        } finally{
            setSearchLoading(false);
        }
    };

    const changeSearchText = (text : string) => {
        setSearchText(text);
        if(text.length === 0){
            setTotalResults(0);
            setSearchedShows([]);
            setSearchLoading(false);
        }
        setHasSearched(false);
    };

    const paginationForSearch = () => {
        if(endIndexForSearch + 5 > searchedShows.length){
            setEndIndexForSearch(searchedShows.length);
        } else {
            setEndIndexForSearch(prev => prev + 5);
        } 
    };

    const paginationForRecent = () => {
        if(endIndexForRecent + 5 > recentlyWatchedEP.length){
            setEndIndexForRecent(recentlyWatchedEP.length);
        } else {
            setEndIndexForRecent(prev => prev + 5);
        } 
    };

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
                        <Ionicons name="search-outline" size={15} color="white" style={{marginRight : 8}}/>
                        <TextInput
                            placeholder="Search your favorite shows"
                            placeholderTextColor={"white"}
                            onChangeText={changeSearchText}
                            value={searchText}
                            autoCapitalize="none"
                            style={styles.searchText}
                            returnKeyType="done"
                        />
                        <Pressable
                            onPress={() => changeSearchText("")}
                            style={({pressed}) => [
                                pressed && { opacity : 0.6 },
                                styles.clearSearchBox
                            ]}
                        >
                            <Text style={styles.clearSearchText}>Clear</Text>
                        </Pressable>
                    </View>
                    {searchLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#03AC13" />
                            <Text style={styles.loadingText}>Searching...</Text>
                        </View>
                    )}
                    {searchText.trim() !== "" && searchedShows.length === 0 && !searchLoading && hasSearched && (
                        <Text style={styles.noResultsText}>No results</Text>
                    )}
                    {searchedShows.length > 0 && searchText.trim() !== "" && (
                        <View style={styles.searchDropdownShowsContainer}>
                        <Text style={styles.resultsNumTitle}>{totalResults} results found</Text>
                            {Array.from(searchedShows).slice(0,endIndexForSearch).map((show,index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => navigation.navigate("ShowInfo",{
                                        showId : show.id,
                                        showPoster : show.posterImage,
                                        showTitle : show.name,
                                        firstAirDate : show.first_air_date.slice(0,4)
                                    })}
                                    style={({pressed}) => [
                                        styles.searchDropdownButton,
                                        pressed && { backgroundColor: '#3E3E40' },
                                        index === searchedShows.length - 1 && { borderBottomWidth: 0 }
                                    ]}
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

                    {endIndexForSearch < totalResults && !searchLoading &&(
                        <Pressable
                            onPress={paginationForSearch}
                            style={({pressed}) => [
                                styles.loadMore,
                                pressed && { opacity : 0.6}
                            ]}
                        >
                            <Text style={styles.loadMoreText}>Load more</Text>
                        </Pressable>
                    )}
                    
                    <View style={styles.recentlyWatchedEpisodesContainer}>
                        <Text style={styles.recentlyWatchedEpisodesSubHeading}>Recently Watched Episodes</Text>
                        {recentlyWatchedEP.length === 0 && (
                            <Text style={styles.noRecentWatchedEPText}>No episodes watched recently. Start searching!</Text>
                        )}
                        {recentlyWatchedEP.length > 0 && (
                            Array.from(recentlyWatchedEP)
                            .slice(0,endIndexForRecent)
                            .map((episode, index) => (
                                <Pressable
                                    key={index}
                                    style={styles.recentlyWatchedEpisodes}
                                    onPress={() => navigation.navigate("ShowRedirect", {
                                        showTitle : episode.show,
                                        episodeName : episode.name,
                                        episodeNum : episode.num,
                                        seasonNum : episode.season,
                                        showPoster : episode.poster,
                                        showId : episode.showId,
                                        overview : episode.overview,
                                        runTime : episode.runTime,
                                        firstAirDate : episode.showFirstAirDate
                                    })}
                                >
                                    <Text style={styles.showTitle}>{episode.show}</Text>
                                    <Text style={styles.episode}>{episode.name}</Text>
                                </Pressable>
                            ))
                        )}
                    </View>
                    { endIndexForRecent < recentlyWatchedEP.length && (
                        <Pressable
                            onPress={paginationForRecent}
                            style={({pressed}) => [
                                styles.loadMore,
                                pressed && { opacity : 0.6}
                            ]}
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
        backgroundColor: "#2C2C2E",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 10,
        width : "92%"
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
        width: "92%",
        alignItems: "center"
    },
    loadMoreText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    },
    noRecentWatchedEPText : {
        color: "#AEAEB2",
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

    searchDropdownText : {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    searchText : {
        color: "white",
        fontSize: 16,
        flex: 1, 
    },
    
    searchDropdownShowsContainer : {
        width: "92%",
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
        marginTop: 5, 
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    
    searchDropdownButton : {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: '#2C2C2E', 
        borderRadius: 6, 
    },
    
    searchAirDate : {
        color : "#AEAEB2",
        fontSize : 13, 
        fontStyle : "italic",
        marginLeft: 8, 
    },
    
    poster : {
        width: 50,    
        height: 75,      
        borderRadius: 6, 
        marginRight: 12,
    },
    resultsNumTitle : {
        textAlign : "left",
        color: "#AEAEB2",
        fontSize: 16,
        fontStyle: "italic",
        marginTop: 5,
        marginBottom : 5,
        width: "100%",
        marginLeft : 10
    },
    noResultsText : {
        textAlign : "center",
        color: "#AEAEB2",
        fontSize: 16,
        fontStyle: "italic",
        marginTop: 5,
        width: "100%",
    },
    clearSearchBox : {
        alignItems : "center",
    },
    clearSearchText : {
        color : "white"
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
});