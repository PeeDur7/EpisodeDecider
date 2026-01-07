import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
type ShowInfoRouteProp = RouteProp<RootStackParamList, 'ShowInfo'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShowInfo() {
    const [loading, setLoading] = useState(false);
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
    const route = useRoute<ShowInfoRouteProp>();
    const showTitle = route.params.showTitle; //get the showTitle parameter from previous pages
    const showId = route.params.showId;
    const showPoster = route.params.showPoster;
    const firstAirDate = route.params.firstAirDate;
    const navigation = useNavigation<NavigationProp>();

    const performSearch = async () => {
        setLoading(true);

        try{
            const tmdbSearchAPI = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}`);
            const tmdbSearchData = await tmdbSearchAPI.json();
            if(tmdbSearchData.number_of_seasons > 0){
                setTotalSeason(tmdbSearchData.number_of_seasons);
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
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionSubheading}>Overview</Text>
                    <Text style={styles.description}>{showDescription}</Text>
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
    descriptionContainer : {

    },
    descriptionSubheading : {
        textAlign : "left",
        color : "white",
        fontWeight : "500",
        fontSize : 20,
        marginHorizontal : 20,
        marginTop : 30,
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
})  