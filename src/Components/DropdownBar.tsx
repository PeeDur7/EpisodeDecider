import { useState } from "react";
import { Pressable, Text } from "react-native";
import { StyleSheet, View } from "react-native";

export default function DropdownBar(contents : Set<string>, initialText : string){
    const [dropDownEnable, setDropDownEnable] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(initialText);

    return(
        <View style={styles.container}>
            <Pressable
                onPress={() => setDropDownEnable(prev => !prev)}
                style={styles.currentSelection}
            >
                <Text style={styles.initialTextStyle}>{initialText}</Text>
            </Pressable>
            {dropDownEnable ? (
                <View style={styles.dropdownList}>
                    {Array.from(contents).map((item,index) => (
                        <Pressable
                            key={index}
                            onPress={() => {
                                setCurrentSelection(item);
                                setDropDownEnable(false);
                            }}
                            style={styles.dropdownListOptions}
                        >
                            <Text style={styles.dropdownListText}>{item}</Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container : {

    },
    currentSelection : {

    },
    initialTextStyle : {

    },
    dropdownList : {

    },
    dropdownListOptions : {

    },
    dropdownListText : {

    }
});