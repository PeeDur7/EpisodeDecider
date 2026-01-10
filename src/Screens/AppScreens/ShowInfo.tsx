import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import DropdownBar from "../../Components/DropdownBar";
type ShowInfoRouteProp = RouteProp<RootStackParamList, 'ShowInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShowInfo() {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [dropDownText, setDropDownText] = useState<string []>([]);
    const [totalSeasons, setTotalSeason] = useState(0);

    //if true, users will enter their own custom ranges, if false, all seasons will be searched
    const [customSeasonRange, setCustomSeasonRange] = useState(false);
    //these 2 variables are for users to enter season ranges 
    const [startSeasonRange, setStartSeasonRange] = useState(1);
    const [endSeasonRange, setEndSeasonRange] = useState(1);

    const [selectSingleSeason, setSelectSingleSeason] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1); //this is for if user selects an individual season

    const [showDescription, setShowDescription] = useState("");
    const [genres, setGenres] = useState<string[]>([]);
    const [seasonsMap, setSeasonsMap] = useState<Map<string,number>>(new Map());
    const route = useRoute<ShowInfoRouteProp>();
    const showTitle = route.params.showTitle; 
    const showId = route.params.showId;
    const showPoster = route.params.showPoster;
    const firstAirDate = route.params.firstAirDate;
    const navigation = useNavigation<NavigationProp>();

    const changeCustomSeasonRange = (text : string) => {
        if(text.trim().toLowerCase() === "custom"){
            setCustomSeasonRange(true);
            setStartSeasonRange(1);
            setEndSeasonRange(totalSeasons);
            setSelectSingleSeason(false);
        } else if(text.trim().toLowerCase() === "all") {
            setCustomSeasonRange(false);
            setStartSeasonRange(1);
            setEndSeasonRange(totalSeasons);
            setSelectSingleSeason(false);
        } else {
            const seasonNum = parseInt(text.replace(/\D/g, '')); //parses Season # and gets only #
            setSelectedSeason(seasonNum);
            setSelectSingleSeason(true);
            setCustomSeasonRange(false);
            setStartSeasonRange(1);
            setEndSeasonRange(totalSeasons);
        }
    }

    const randomizeEpisode = async () => {
        setSubmitLoading(true);
        try{
            let randomSeason = 0;
            if(selectSingleSeason && selectedSeason){ //for a random episode in an indiviudal season
                randomSeason = selectedSeason;
            } else if(customSeasonRange){
                randomSeason = Math.floor(Math.random() * (endSeasonRange - startSeasonRange + 1)) + startSeasonRange;
            } else {
                randomSeason = Math.floor(Math.random() * (totalSeasons) + 1);
            }
            const randomSeasonString = `Season ${randomSeason}`;
            const episodesInSeason = seasonsMap.get(randomSeasonString);
            if(!episodesInSeason){
                console.log(`Season ${randomSeason} not found`);
                return;            
            }
            if(episodesInSeason){
                const randomEpisode = Math.floor(Math.random() * episodesInSeason) + 1;
                const tmdbAPI = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${randomSeason}?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}`);
                const tmdbData = await tmdbAPI.json();
                if(tmdbData.episodes.length > 0){
                    const episodeAPI = tmdbData.episodes[randomEpisode-1];
                    const overview = episodeAPI.overview;
                    const episodeName = episodeAPI.name;
                    const runtime = episodeAPI.runtime;
                    navigation.navigate("ShowRedirect",{
                        showTitle : showTitle,
                        showId : showId,
                        episodeName : episodeName,
                        showPoster : showPoster,
                        episodeNum : randomEpisode,
                        seasonNum : randomSeason,
                        overview : overview,
                        runTime : runtime,
                        firstAirDate : firstAirDate
                    });
                }
            }
        }catch(error){
            console.log(error);
        }finally{
            setSubmitLoading(false);
        }
    }

    const performSearch = async () => {
        setLoading(true);

        try{
            const tmdbSearchAPI = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}`);
            const tmdbSearchData = await tmdbSearchAPI.json();
            if(tmdbSearchData.seasons.length > 0){
                const dropDown = ["All", "Custom"];
                const tempMap = new Map<string,number>();
                let seasonCount = 0;
                for(let index = 0; index < tmdbSearchData.seasons.length; index++){
                    if(tmdbSearchData.seasons[index].name.toLowerCase().includes("season") && 
                        tmdbSearchData.seasons[index].air_date !== null && tmdbSearchData.seasons[index].episode_count){
                        seasonCount++;
                        tempMap.set(tmdbSearchData.seasons[index].name,tmdbSearchData.seasons[index].episode_count);
                        dropDown.push(tmdbSearchData.seasons[index].name);
                    }
                }
                setSeasonsMap(tempMap);
                setTotalSeason(seasonCount);
                setEndSeasonRange(seasonCount);
                setDropDownText(dropDown);
            }
            if(tmdbSearchData.overview){
                setShowDescription(tmdbSearchData.overview);
            }
            if(tmdbSearchData.genres){
                setGenres(tmdbSearchData.genres.map((g: any) => g.name));
            }
        } catch(error){
            console.log(error);
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        const initalize = async () => {
            await performSearch();
        }
        initalize();
    },[]);

    if(loading){
        return(
            <SafeAreaView style={styles.container}/>
        );
    }

    return (
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({pressed}) => [
                        pressed && { opacity : 0.6 },
                        styles.backButton
                    ]}  
                >
                    <Ionicons name="arrow-back" size={25} color="white"/>
                </Pressable>
                {showPoster ? (
                    <Image
                        source={{uri : showPoster}}
                        style={styles.poster}
                    />
                ) : (
                    <View style={[styles.poster, {backgroundColor : '#555', justifyContent : "center", alignItems : "center"},]}>
                        <Text style={styles.noPoster}>?</Text>
                    </View>
                )}
                <Text style={styles.showTitle}>{showTitle}</Text>
                <View style={styles.datesContainer}>
                    <Text style={styles.datesText}>{firstAirDate}</Text>
                    {totalSeasons > 0 && (
                        <>
                            <Text style={styles.datesText}>•</Text>
                            <Text style={styles.datesText}>
                                {totalSeasons} Season{totalSeasons === 1 ? "" : "s"}
                            </Text>
                        </>
                    )}
                </View>
                {genres.length > 0 && (
                    <View style={styles.genreTagsContainer}>
                        {genres.map((genre,index) => (
                            <View key={index} style={styles.genreTag}>
                                <Text style={styles.genreText}>{genre}</Text>
                            </View>
                        ))}
                    </View>
                )}
                <View>
                    <Text style={styles.descriptionSubheading}>Overview</Text>
                    <Text style={styles.description}>{showDescription}</Text>
                </View>
                <Text style={styles.selectSeasonRangeText}>Select Season Range</Text>
                <DropdownBar
                    contents={new Set(dropDownText)}
                    initialText="All"
                    onSelectionChange={(value) => changeCustomSeasonRange(value)}
                    disabled={submitLoading}
                />
                {customSeasonRange && (
                    <View style={styles.customSeasonContainer}>
                        <Text style={styles.customSeasonStartText}>Season start range</Text>
                        <DropdownBar
                            contents={new Set(
                                Array.from(seasonsMap.keys()).filter(season => {
                                    const seasonNum = parseInt(season.replace(/\D/g, ''));
                                    const currentEndRange = endSeasonRange === 0 ? totalSeasons : endSeasonRange;
                                    return seasonNum < currentEndRange;
                                })
                            )}
                            initialText="Season 1"
                            onSelectionChange={(value) => {
                                const seasonNum = parseInt(value.replace(/\D/g, ''));
                                setStartSeasonRange(seasonNum);
                            }}
                            disabled={submitLoading}
                        />
                        <Text style={styles.customSeasonsEndText}>Season end range</Text>
                        <DropdownBar
                            contents={new Set(
                                Array.from(seasonsMap.keys()).filter(season => {
                                    const seasonNum = parseInt(season.replace(/\D/g, ''));
                                    const currentStartRange = startSeasonRange === 0 ? 1 : startSeasonRange;
                                    return seasonNum > currentStartRange;
                                })
                            )}
                            initialText={`Season ${totalSeasons}`}
                            onSelectionChange={(value) => {
                                const seasonNum = parseInt(value.replace(/\D/g, ''));
                                setEndSeasonRange(seasonNum);
                            }}
                            disabled={submitLoading}
                        />
                    </View>
                )}
                <Pressable
                    onPress={randomizeEpisode}
                    style={({pressed}) => [
                        styles.submitButton,
                        pressed && { opacity : 0.6 }
                    ]}
                    disabled={submitLoading}
                >   
                    <Text style={styles.submitButtonText}>
                        Randomize episode
                    </Text>
                </Pressable>
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
    backButton : {
        position: "absolute",
        top: 50,
        left: 15,
        zIndex: 10,
        padding: 10
    },
    poster : {
        width: 150,    
        height: 225,      
        borderRadius: 6, 
        marginTop : 40
    },
    noPoster : {
        fontSize : 100,
        color : "white",
    },
    showTitle : {
        color : "white",
        fontSize : 30,
        marginTop : 10,
        textAlign : "center",
        marginHorizontal : 5
    },
    datesContainer : {
        flexDirection : "row",
        textAlign : "center",
        marginTop : 5,
    },
    datesText : {
        color : "#AEAEB2",
        fontSize : 16,
        marginHorizontal : 5
    },
    genreTagsContainer : {
        flexDirection : "row",
        flexWrap : "wrap",
        marginTop : 10,
        justifyContent : "center",
    },
    genreTag : {
        marginHorizontal : 5,
        marginVertical : 5,
        borderRadius : 15,
        backgroundColor : "#0096C7",
        paddingVertical : 5,
        paddingHorizontal : 10,
    },
    genreText : {
        color : "white"
    },
    descriptionSubheading : {
        textAlign : "left",
        color : "white",
        fontWeight : "500",
        fontSize : 20,
        marginHorizontal : 20,
        marginTop : 20,
    },
    description : {
        color : "#AEAEB2",
        fontSize : 15,
        textAlign : "left", 
        lineHeight : 20, 
        fontStyle : "italic",
        fontWeight : "400", 
        marginTop : 5,
        marginHorizontal : 20,  
    },
    submitButton : {
        marginTop : 15,
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "90%",
        alignItems: "center"
    },
    submitButtonText : {
        color : "white",
        fontWeight: "600",
        fontSize : 15,
        paddingVertical : 12,
    },
    selectSeasonRangeText : {
        color : "white",
        fontSize : 15,
        textAlign : "left",
        width : "90%",
        fontWeight : "500",
        marginTop : 20,
        marginBottom : 5
    },
    customSeasonContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 15,
    },
    customSeasonStartText: {
        color: "white",
        fontSize: 15,
        textAlign: "left",
        width: "90%",
        fontWeight: "500",
        marginTop: 10,
        marginBottom: 5,
    },
    customSeasonsEndText: {
        color: "white",
        fontSize: 15,
        textAlign: "left",
        width: "90%",
        fontWeight: "500",
        marginTop: 15,
        marginBottom: 5,
    },
})  