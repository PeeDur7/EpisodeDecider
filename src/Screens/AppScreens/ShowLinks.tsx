import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../Navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import  Constants  from "expo-constants";
import * as streamingAvailability from "streaming-availability";
import { Ionicons } from "@expo/vector-icons";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ShowLinks = RouteProp<RootStackParamList, 'ShowRedirect'>;

interface userWatchedShows {
    id : number,
    showTitle : string;
    poster? : string;
    firstAirDate : string;
}

interface userWatchedEpisodes {
    show : string,
    name : string,
    num : number,
    season : number;
    poster? : string;
    showId : number;
    overview : string;
    runTime : number;
    showFirstAirDate : string;
}

export default function ShowLinks(){
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [useruid, setUseruid] = useState("");
    const [recenetlyWathcedShows, setRecentlyWatchedShows] = useState<Set<userWatchedShows>>(new Set());
    const [recentlyWatchedEP, setRecentlyWatchedEP] = useState<Set<userWatchedEpisodes>>(new Set());
    const [usersPreferedServices, setUserPreferedServices] = useState<Set<string>>(new Set());
    const [streamingServicesOfShows, setStreamingServicesOfShows] = useState<Map<string,number>>(new Map());
    const [streamingServicesWithLinks, setStreamingServicesWithLinks] = useState<Map<string,string>>(new Map());
    const [orderedStreamingServices, setOrderStreamingServices] = useState<Map<string,string>>(new Map());
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ShowLinks>();
    const showTitle = route.params.showTitle;
    const showId = route.params.showId;
    const episodeName = route.params.episodeName;
    const episodeNum = route.params.episodeNum;
    const seasonNum = route.params.seasonNum;
    const overview = route.params.overview;
    const runtime = route.params.runTime;
    const showPoster = route.params.showPoster;
    const firstAirDate = route.params.firstAirDate;
    const MAX_RECENT_ITEMS = 20;

    const selectiveServices = [
        "Amazon Prime Video",
        "Netflix",
        "Paramount Plus",
        "HBO Max",
        "Hulu",
        "Disney Plus"
    ];

    const normalizeServiceName = (name: string): string => {
        const nameMap: { [key: string]: string } = {
            "Amazon Prime Video": "Prime Video",
            "Amazon Video" : "Prime Video",
            "Prime Video": "Prime Video",
            "Paramount Plus": "Paramount+",
            "Paramount Plus Apple TV Channel" : "Paramount+",
            "Paramount+ Amazon Channel" : "Paramount+",
            "Paramount+ Roku Premium Channel" : "Paramount+",
            "Paramount Plus Essential" : "Paramount+",
            "Paramount Plus Premium" : "Paramount+",
            "Paramount+": "Paramount+",
            "Disney Plus": "Disney+",
            "Disney+": "Disney+",
            "HBO Max": "Max", 
            "Max": "Max"
        };
        return nameMap[name] || name;
    };

    const performSearch = async () => {
        try{
            const tmdbAPI = await fetch(`https://api.themoviedb.org/3/tv/${showId}/watch/providers?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}`);
            const tmdbData = await tmdbAPI.json();
            let streamingProviders = new Map<string,number>();
            if(tmdbData.results){
                if(tmdbData.results.US){
                    const processProviders = (providers : any []) => {
                        for(let i = 0; i< providers.length; i++){
                            const provider = providers[i].provider_name
                            const providerId = providers[i].provider_id;
                            const normalized = normalizeServiceName(provider);
                            const isSelective = selectiveServices.includes(provider) || 
                                          selectiveServices.some(s => normalizeServiceName(s) === normalized);
                            if(isSelective && provider && providerId){
                                streamingProviders.set(normalized,providerId);
                            }
                        }
                    } ;
                    if(tmdbData.results.US.buy){
                        processProviders(tmdbData.results.US.buy);
                    }
                    if(tmdbData.results.US.flatrate){
                        processProviders(tmdbData.results.US.flatrate);
                    }
                    if(tmdbData.results.US.ads){
                        processProviders(tmdbData.results.US.ads);
                    }
                }

            }
            setStreamingServicesOfShows(streamingProviders);
        }catch(error){
            console.log(error);
        }
    };

    useEffect(() => {
        const initalize = async () => {
            try{
                const user = auth.currentUser;
                if(user && user.uid){
                    setUseruid(user.uid);
                    getDoc(doc(db,"users",user.uid)).then(userDoc => {
                        if(userDoc.exists()){
                            const userData = userDoc.data();
                            if(userData.recentlyWatchedShows){
                                setRecentlyWatchedShows(new Set(userData.recentlyWatchedShows));
                            }
                            if(userData.recentlyWatchedEP){
                                setRecentlyWatchedEP(new Set(userData.recentlyWatchedEP));
                            }
                            if(userData.preferredStreamingServices){
                                setUserPreferedServices(new Set(userData.preferredStreamingServices));
                            }
                        }
                    });
                }
                await performSearch();
                
            }catch(error){
                console.log(error);
            }
        };
        initalize();
    },[]);

    useEffect(() => {
        if (streamingServicesOfShows.size > 0) {
            createStreamingServicesWithLinks();
        }    
    },[streamingServicesOfShows]);

    useEffect(() => {
        if (streamingServicesWithLinks.size > 0) {
            sortStreamingProviders();
        }
    },[streamingServicesWithLinks,usersPreferedServices]);

    const submitRecentlyWatchedEPToDB = async () => {
        const newEpisode : userWatchedEpisodes = {
            show : showTitle,
            showId : showId,
            name : episodeName,
            num : episodeNum,
            season : seasonNum,
            poster : showPoster,
            overview : overview,
            runTime : runtime,
            showFirstAirDate : firstAirDate
        };
        const episodeArrayForm = Array.from(recentlyWatchedEP);
        const filteredEpisodeArray = episodeArrayForm.filter(ep => 
            !(ep.showId === newEpisode.showId && 
                ep.season === newEpisode.season && 
                ep.num === newEpisode.num)
        );
        const updatedEpisodeArray = [newEpisode, ...filteredEpisodeArray];
        const limitEpisodeArray = updatedEpisodeArray.slice(0,MAX_RECENT_ITEMS);
        setRecentlyWatchedEP(new Set(limitEpisodeArray));
        const user = auth.currentUser;

        if(user && user.uid){
            try{
                await updateDoc(doc(db,"users",user.uid),{
                    recentlyWatchedEP : limitEpisodeArray
                });
            }catch(error){
                console.log(error);
            }
        }
    };

    const submitRecentlyWatchedShowToDB = async () => {
        const newShow : userWatchedShows = {
            id : showId,
            showTitle : showTitle,
            poster : showPoster,
            firstAirDate : firstAirDate
        };
        const showArrayForm = Array.from(recenetlyWathcedShows);
        const filtedShowArray = showArrayForm.filter(show => show.id !== newShow.id);
        const updatedShowArray = [newShow, ...filtedShowArray];
        const limitedShowArray = updatedShowArray.slice(0,MAX_RECENT_ITEMS);
        setRecentlyWatchedShows(new Set(limitedShowArray));
        const user = auth.currentUser;

        if(user && user.uid){
            try{
                await updateDoc(doc(db,"users",user.uid), {
                    recentlyWatchedShows : limitedShowArray
                })
            }catch(error){
                console.log(error);
            }
        }
    };

    const sortStreamingProviders = () => {
        const tempStreamingProviders = new Map<string,string>();
        Array.from(usersPreferedServices).filter(service => streamingServicesOfShows.has(service)).forEach((service) => {
            const link = streamingServicesWithLinks.get(service);
            if(link !== undefined){
                tempStreamingProviders.set(service, link);
            }
        });
        Array.from(streamingServicesOfShows.keys()).filter(service => !usersPreferedServices.has(service)).forEach((service) => {
            const link = streamingServicesWithLinks.get(service);
            if(link !== undefined){
                tempStreamingProviders.set(service,link);
            }
        })
        setOrderStreamingServices(tempStreamingProviders);
    };

    const createStreamingServicesWithLinks = async () => {
        const tempStreamingProvidersWithLinks = new Map<string,string>();

        try{
            const RAPID_API_KEY = Constants.expoConfig?.extra?.movieOfTheNightApiKey;
            const client = new streamingAvailability.Client(new streamingAvailability.Configuration({
                apiKey : RAPID_API_KEY
            }));
            const showData = await client.showsApi.getShow({
                id : `tv/${showId.toString()}`,
                country : 'us'
            });
            if(showData && showData.streamingOptions && showData.streamingOptions.us){
                const streamingOptionsList = showData.streamingOptions.us;
                for(let i = 0; i < streamingOptionsList.length; i++){
                    const serviceName = streamingOptionsList[i].service.name;
                    const normalizedServiceName = normalizeServiceName(serviceName);
                    
                    if(streamingServicesOfShows.has(serviceName) || streamingServicesOfShows.has(normalizedServiceName)){
                        const link = streamingOptionsList[i].link;
                        const videoLink = streamingOptionsList[i].videoLink;
                        if(videoLink){
                            tempStreamingProvidersWithLinks.set(normalizedServiceName, videoLink);
                        } else if(link){
                            tempStreamingProvidersWithLinks.set(normalizedServiceName, link);
                        }
                    }
                }
            }
            setStreamingServicesWithLinks(tempStreamingProvidersWithLinks);
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false);
        }
    };

    const openStreamingLink = async (serviceName: string, webLink: string) => {
        setSubmitLoading(true);
        try{
            const appDeepLink = convertToAppDeepLink(serviceName, webLink);
            const canOpenAppDeepLink = await Linking.canOpenURL(appDeepLink);
            if(canOpenAppDeepLink){
                await Linking.openURL(appDeepLink);
                await submitRecentlyWatchedEPToDB();
                await submitRecentlyWatchedShowToDB();
            }else{
                const canAppOpen = await Linking.canOpenURL(webLink);
                if(canAppOpen){
                    await Linking.openURL(webLink);
                    await submitRecentlyWatchedEPToDB();
                    await submitRecentlyWatchedShowToDB();
                } else {
                    console.log("link cannot be open");
                }
            }
        }catch(error){
            console.log(error);
        }finally{
            setSubmitLoading(false);
        }
    }

    const convertToAppDeepLink = (serviceName : string, webLink : string) => {
        if(serviceName === "Netflix"){
            const titleMatch = webLink.match(/\/title\/(\d+)/); //get show id for netflix url
            if(titleMatch){
                return `nflx://www.netflix.com/title/${titleMatch[1]}`;
            }
            return webLink.replace("https://www.netflix.com","nflx://www.netflix.com");
        }else if(serviceName === "Prime Video"){
            const asinMatch = webLink.match(/\/(dp|gp\/video\/detail)\/([A-Z0-9]+)/);
            if (asinMatch) {
                return `primevideo://watch/${asinMatch[2]}`;
            }
            return webLink.replace("https://","primevideo://");
        }else if(serviceName === "Disney Plus" || serviceName === "Disney+"){
            const match = webLink.match(/\/(movies|series)\/([a-z0-9-]+)/i);
            if(match){
                return `disneyplus://${match[1]}/${match[2]}`;
            }
            return webLink.replace("https://www.disneyplus.com","disneyplus://");
        }else if(serviceName === "Hulu"){
            const huluMatch = webLink.match(/\/(watch|series)\/([0-9a-f-]+)/);
            if (huluMatch) {
                return `hulu://${huluMatch[1]}/${huluMatch[2]}`;
            }
            return webLink.replace("https://www.hulu.com/","hulu://");
        }else if(serviceName === "Paramount Plus" || serviceName === "Paramount+"){
            const match = webLink.match(/\/(shows|movies)\/[^/]+\/([a-z0-9-]+)/i);
            if(match){
                return `paramountplus://${match[1]}/${match[2]}`;
            }
            return webLink.replace("https://www.paramountplus.com/", "paramountplus://");
        }else if(serviceName === "Max" || serviceName === "HBO Max"){
            const match = webLink.match(/feature\/urn:hbo:feature:([a-z0-9-]+)/i);
            if(match){
                return `max://feature/${match[1]}`;
            }
            return webLink.replace("https://","max://");
        }else{
            return webLink;
        }
    };

    if(loading){
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
                <ScrollView 
                    style={{ backgroundColor : "#3A3A3C", flex : 1, width: '100%' }} 
                    bounces={false} 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{alignItems : "center", paddingTop : 10}}                
                >
                    {showPoster ? (                    
                        <Image source={{uri : showPoster}} style={styles.poster}/>
                    ) : (
                        <View style={[styles.poster, {backgroundColor : '#555', justifyContent : "center", alignItems : "center", marginBottom : 10}]}>
                            <Text style={styles.noPoster}>?</Text>
                        </View>
                    )}
                    <Text style={styles.showTitleText}>{showTitle}</Text>
                    <View style={styles.episodeInfoContainer}>
                        <Text style={styles.episodeNameText}>{episodeName}: </Text>
                        <Text style={styles.episodeInfo}>Season {seasonNum}, Episode {episodeNum}</Text>
                    </View>
                    <Text style={styles.runtime}>{runtime} min runtime</Text>
                    <Text style={styles.overview}>Episode Overview</Text>
                    <Text style={styles.overviewText}>{overview}</Text>

                    {orderedStreamingServices.size > 0 && (
                        <View style={styles.streamingServicesContainer}>
                            {Array.from(orderedStreamingServices.keys()).map((service) => {
                                const link = orderedStreamingServices.get(service)
                                return(
                                    <Pressable
                                        key={service}
                                        onPress={() => link && openStreamingLink(service,link)}
                                        style={({pressed}) => [
                                            pressed && { opacity : 0.6},
                                            styles.serviceButton
                                        ]}
                                        disabled={submitLoading}
                                    >
                                        <Text style={styles.linkButtonText}>{service}</Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                    )}
                    {orderedStreamingServices.size === 0 && !loading && (
                        <Text style={styles.noServicesFound}>No services have this show</Text>
                    )}
                    {submitLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#03AC13" />
                            <Text style={styles.loadingText}>Episode loading</Text>
                        </View>
                    )}
                </ScrollView>
        </SafeAreaView>
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
        marginTop : 60
    },
    showTitleText : {
        color : "white",
        fontSize : 25,
        textAlign : "center",
        marginHorizontal : 10,
        fontWeight : "500"
    },
    episodeInfoContainer : {
        flexDirection : "row",
        marginTop : 5,
        marginHorizontal : 10,
        textAlign : "center",
        justifyContent : "center",
        flexWrap : "wrap"
    },
    episodeNameText : {
        color : "white",
        fontSize : 18,
        textAlign : "center",
        fontStyle : "italic"
    },
    episodeInfo : {
        color : "white",
        fontSize : 18,
        textAlign : "center"
    },
    runtime : {
        color : "#AEAEB2",
        fontSize : 18,
        marginTop : 5,
        fontStyle : "italic"
    },
    overview : {
        marginTop : 30,
        fontWeight : "500",
        color : "white",
        fontSize : 18,
        width : "90%"
    },
    overviewText : {
        marginTop : 5,
        color : "#AEAEB2",
        fontSize : 15,
        width : "90%",
        fontStyle : "italic",
    },
    streamingServicesContainer : {
        width: '90%',
        marginTop: 20,
        gap: 12, 
    },
    serviceButton : {
        backgroundColor : "#03AC13",        
        borderRadius : 8,
        width: "100%", 
        alignItems: "center"
    },
    linkButtonText : {
        color : "white",
        fontWeight : "500",
        fontSize : 14,
        paddingVertical : 12,
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
    noServicesFound : {
        marginTop : 50,
        color : "red",
        fontSize : 20,
        fontWeight : "500",
        fontStyle : "italic"
    },
    noPoster : {
        fontSize : 100,
        color : "white",
    }
})