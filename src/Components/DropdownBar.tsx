import { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DropdownBarProps {
    contents: Set<string>;
    initialText: string;
    onSelectionChange?: (value: string) => void;
}

export default function DropdownBar({ 
    contents, 
    initialText, 
    onSelectionChange 
}: DropdownBarProps) {
    const [dropDownEnable, setDropDownEnable] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(initialText);

    // Filter out the currently selected item
    const availableOptions = Array.from(contents).filter(
        item => item !== currentSelection
    );

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => setDropDownEnable(prev => !prev)}
                style={({ pressed }) => [
                    styles.currentSelection,
                    pressed && styles.pressed,
                    dropDownEnable && styles.dropdownOpen
                ]}
            >
                <Text style={styles.currentSelectionText}>{currentSelection}</Text>
                <Ionicons 
                    name={dropDownEnable ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#8E8E93" 
                />
            </Pressable>

            {dropDownEnable && (
                <View style={styles.dropdownList}>
                    {availableOptions.length > 0 ? (
                        availableOptions.map((item, index) => (
                            <Pressable
                                key={index}
                                onPress={() => {
                                    setCurrentSelection(item);
                                    setDropDownEnable(false);
                                    onSelectionChange?.(item);
                                }}
                                style={({ pressed }) => [
                                    styles.dropdownListOptions,
                                    pressed && styles.optionPressed,
                                    index === availableOptions.length - 1 && styles.lastOption
                                ]}
                            >
                                <Text style={styles.dropdownListText}>{item}</Text>
                            </Pressable>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No other options</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width : "90%"
    },
    currentSelection: {
        padding: 16,
        backgroundColor: "#2C2C2E",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#3A3A3C",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pressed: {
        backgroundColor: "#38383A",
        opacity: 0.8,
    },
    dropdownOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    currentSelectionText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "left",
    },
    dropdownList: {
        backgroundColor: "#2C2C2E",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderColor: "#3A3A3C",
        overflow: "hidden",
    },
    dropdownListOptions: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#3A3A3C",
        backgroundColor: "#2C2C2E",
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    optionPressed: {
        backgroundColor: "#38383A",
    },
    dropdownListText: {
        color: "white",
        fontSize: 16,
        textAlign: "left",
        fontWeight: "400",
    },
    emptyState: {
        padding: 20,
        alignItems: "center",
    },
    emptyStateText: {
        color: "#8E8E93",
        fontSize: 14,
        fontStyle: "italic",
    }
});