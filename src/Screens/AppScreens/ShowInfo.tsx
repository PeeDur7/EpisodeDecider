import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../Navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useState } from "react";

type ShowInfoRouteProp = RouteProp<RootStackParamList, 'ShowInfo'>;

export default function ShowInfo() {
    const [totalSeasons, setTotalSeason] = useState(0);
    //if true, users will enter their own custom ranges, if false, all seasons will be searched
    const [customSeasonRange, setCustomSeasonRange] = useState(false);
    //these 2 variables are for users to enter season ranges 
    //if these 2 are same value, select from the same season
    const [startSeasonRange, setStartSeasonRange] = useState(0);
    const [endSeasonRange, setEndSeasonRange] = useState(0);
    const [showPoster, setShowPoster] = useState("");
    const [showDescription, setShowDescription] = useState("");
    const route = useRoute<ShowInfoRouteProp>();
    const { showTitle } = route.params; //get the showTitle parameter from previous pages

    return (
        <SafeAreaView style={styles.container}>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {

    }
})