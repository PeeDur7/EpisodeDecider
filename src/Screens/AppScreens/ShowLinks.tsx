import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../Navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import  Constants  from "expo-constants";
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
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [useruid, setUseruid] = useState("");
    const [recenetlyWathcedShows, setRecentlyWatchedShows] = useState<Set<userWatchedShows>>(new Set());
    const [recentlyWatchedEP, setRecentlyWatchedEP] = useState<Set<userWatchedEpisodes>>(new Set());
    const [usersPreferedServices, setUserPreferedServices] = useState<Set<string>>(new Set());
    const [streamingServicesOfShows, setStreamingServicesOfShows] = useState<Set<string>>(new Set());
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

    const performSearch = async () => {
        try{
            const tmdbAPI = await fetch(`https://api.themoviedb.org/3/tv/${showId}/watch/providers?api_key=${Constants.expoConfig?.extra?.tmdbApiKey}`);
            const tmdbData = await tmdbAPI.json();
            let streamingProviders = new Set<string>();
            if(tmdbData.results){
                if(tmdbData.results.US){
                    if(tmdbData.results.US.buy){
                        for(let i = 0; i < tmdbData.results.US.buy.length; i++){
                            if(tmdbData.results.US.buy[i].provider_name){
                                streamingProviders.add(tmdbData.results.US.buy[i].provider_name);
                            }
                        }
                    }
                    if(tmdbData.results.US.flatrate){
                        for(let i = 0; i<tmdbData.results.US.flatrate.length; i++){
                            if(tmdbData.results.US.flatrate[i].provider_name){
                                streamingProviders.add(tmdbData.results.US.flatrate[i].provider_name); 
                            }
                        }
                    }
                    if(tmdbData.results.US.ads){
                        for(let i = 0; i<tmdbData.results.US.ads.length; i++){
                            if(tmdbData.results.US.ads[i].provider_name){
                                streamingProviders.add(tmdbData.results.US.ads[i].provider_name);
                            }
                        }
                    }
                }

            }
            setStreamingServicesOfShows(streamingProviders);
        }catch(error){
            console.log(error);
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
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
        performSearch();
        setLoading(false);
    },[]);

    useEffect(() => {
        createStreamingServicesWithLinks();
    },[useruid]);

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
        const newSet = new Set(recentlyWatchedEP).add(newEpisode);
        setRecentlyWatchedEP(newSet);
        const user = auth.currentUser;

        if(user && user.uid){
            try{
                await updateDoc(doc(db,"users",user.uid),{
                    recentlyWatchedEP : Array.from(newSet)
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
        const newSet = new Set(recenetlyWathcedShows).add(newShow);
        setRecentlyWatchedShows(newSet);
        const user = auth.currentUser;

        if(user && user.uid){
            try{
                await updateDoc(doc(db,"users",user.uid), {
                    recentlyWatchedShows : Array.from(newSet)
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
        Array.from(streamingServicesOfShows).filter(service => !usersPreferedServices.has(service)).forEach((service) => {
            const link = streamingServicesWithLinks.get(service);
            if(link !== undefined){
                tempStreamingProviders.set(service,link);
            }
        })
        setOrderStreamingServices(tempStreamingProviders);
    };

    const createStreamingServicesWithLinks = async () => {
        const tempStreamingProvidersWithLinks = new Map<string,string>();
        
    };



    if(loading){
        return(
            <SafeAreaView style={styles.container}/>
        );
    }

    return(
        <ScrollView style={{ backgroundColor : "#3A3A3C", flex : 1 }} bounces={false} showsVerticalScrollIndicator={false}>
            <SafeAreaView style={styles.container}>

            </SafeAreaView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container : {
        backgroundColor : "#3A3A3C",
        flex : 1,
        alignItems : "center"
    },
    
})