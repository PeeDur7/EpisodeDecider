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
import Checkbox from "expo-checkbox";
type ShowInfoRouteProp = RouteProp<RootStackParamList, 'ShowInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShowInfo() {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [dropDownText, setDropDownText] = useState<string []>([]);
    const [totalSeasons, setTotalSeason] = useState(0);
    //just in case user wants episodes that are shorter than a specifc amount of time
    const [runTime, setRunTime] = useState(false);
    const [runTimeLimit, setRunTimeLimit] = useState(0);

    //if true, users will enter their own custom ranges, if false, all seasons will be searched
    const [customSeasonRange, setCustomSeasonRange] = useState(false);

    //these 2 variables are for users to enter season ranges 
    //if these 2 are same value, select from the same season
    const [startSeasonRange, setStartSeasonRange] = useState(0);
    const [endSeasonRange, setEndSeasonRange] = useState(0);

    const [showDescription, setShowDescription] = useState("");
    const [genres, setGenres] = useState<string[]>([]);
    const [seasonsMap, setSeasonsMap] = useState<Map<string,number>>(new Map());
    const route = useRoute<ShowInfoRouteProp>();
    const showTitle = route.params.showTitle; //get the showTitle parameter from previous pages
    const showId = route.params.showId;
    const showPoster = route.params.showPoster;
    const firstAirDate = route.params.firstAirDate;
    const navigation = useNavigation<NavigationProp>();

    const changeCustomSeasonRange = (text : string) => {
        if(text.trim().toLowerCase() === "custom"){
            setCustomSeasonRange(true);
            setStartSeasonRange(1);
            setEndSeasonRange(totalSeasons);
        } else {
            setCustomSeasonRange(false);
            setStartSeasonRange(0);
            setEndSeasonRange(0);
        }
    }  

    const changeRunTime = () => {
        if(runTime){
            setRunTimeLimit(0);
        }
        setRunTime(prev => !prev);
    }

    const changeRunTimeLimit = (text : string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setRunTimeLimit(numericValue === "" ? 0 : +numericValue);
    }

    //finds a random episode based on criteria user wants, then sends it to the other page
    const randomizeEpisode = async () => {
        setSubmitLoading(true);
        try{

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
                    if(tmdbSearchData.seasons[index].name.toLowerCase().includes("season")){
                        seasonCount++;
                        tempMap.set(tmdbSearchData.seasons[index].name,tmdbSearchData.seasons[index].episode_count);
                        dropDown.push(tmdbSearchData.seasons[index].name);
                    }
                }
                setSeasonsMap(tempMap);
                setTotalSeason(seasonCount);
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
        performSearch();
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
                        />
                    </View>
                )}
                <Pressable
                    onPress={changeRunTime}
                    style={{ flexDirection: "row", alignItems: "center", marginTop: 20, marginLeft : 5, marginBottom : 10 }}
                >
                    <Checkbox
                        value={runTime}
                        onValueChange={setRunTime}
                        style={{marginRight : 5, borderRadius : 5}}
                    />
                    <Text style={{color : "white", fontWeight : "400", fontStyle : "italic"}}>Want a specifc episodes under a certain run time?</Text>
                </Pressable>
                {runTime && (
                    <TextInput
                        style={styles.runTimeLimitText}
                        placeholder="Max amount of run time you're willing to watch"
                        onChangeText={changeRunTimeLimit}
                        placeholderTextColor="white"
                        keyboardType="number-pad"
                        value={runTimeLimit === 0 ? "" : runTimeLimit.toString()}                    
                    />
                )}
                <Pressable
                    onPress={randomizeEpisode}
                    style={styles.submitButton}
                    disabled={submitLoading}
                >   
                    <Text style={styles.submitButtonText}>
                        {submitLoading ? "Processing... please wait" : "Randomize episode"}
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
        marginTop : 10
    },
    genreTag : {
        marginHorizontal : 5,
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
    runTimeLimitText : {
        color : "white",
        fontWeight : "500",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 8,
        padding: 12,
        width: "90%",
        marginBottom : 10
    }
})  