import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "../Screens/AppScreens/Home";
import SearchPage from "../Screens/AppScreens/Search";
import SettingPage from "../Screens/AppScreens/Setting";
import { Ionicons } from "@expo/vector-icons";

const tab = createBottomTabNavigator();

export default function NavBar(){
    return(
        <tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#2C2C2E', 
                    borderTopColor: '#1C1C1E', 
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#42A5F5',
                tabBarInactiveTintColor: '#8E8E93',
            }}
        >
            <tab.Screen 
                name="Home" 
                component={HomePage}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Ionicons
                            name="home"
                            size={20}
                            color={focused ? "#42A5F5" : "grey"}
                        />
                    )
                }}
            />
            <tab.Screen 
                name="Search" 
                component={SearchPage}
                options={{
                    tabBarIcon : ({focused}) => (
                        <Ionicons
                            name="search"
                            size={20}
                            color={focused ? "#42A5F5" : "grey"}
                        />
                    )
                }}
            />
            <tab.Screen 
                name="Settings" 
                component={SettingPage}
                options={{
                    tabBarIcon : ({focused}) => (
                        <Ionicons
                            name="settings"
                            size={20}
                            color={focused ? "#42A5F5" : "grey"}
                        />
                    )
                }}
            />
        </tab.Navigator>
    );
}