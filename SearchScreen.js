import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadSearchHistory();
    }, []);

    const loadSearchHistory = async () => {
        try {
            const history = await AsyncStorage.getItem('searchHistory');
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim() === '') {
            Alert.alert('Please enter a search query');
            return;
        }

        const existingIndex = searchHistory.findIndex(item => item.toLowerCase() === searchQuery.toLowerCase());
        let newHistory;

        if (existingIndex !== -1) {
            newHistory = [searchQuery, ...searchHistory.filter((_, index) => index !== existingIndex)];
        } else {
            newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
        }

        try {
            await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
            setSearchHistory(newHistory);
        } catch (error) {
            console.error('Failed to save search history:', error);
        }

        navigation.navigate('SearchResult', { searchQuery });
    };

    const handleHistoryPress = (item) => {
        setSearchQuery(item);
    };

    const handleDelete = async (itemToDelete) => {
        const newHistory = searchHistory.filter(item => item !== itemToDelete);
        try {
            await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
            setSearchHistory(newHistory);
        } catch (error) {
            console.error('Failed to delete search history item:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Trang sức tỷ đô"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={handleSearch} style={styles.iconContainer}>
                    <Icon name="search-outline" size={25} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nuôi Dạy Con</Text>
                </View>

                <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>Lịch sử tìm kiếm</Text>
                    {searchHistory.map((item, index) => (
                        <View key={index} style={styles.historyItemContainer}>
                            <TouchableOpacity onPress={() => handleHistoryPress(item)} style={styles.historyItem}>
                                <Text style={styles.historyText}>{item}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteIcon}>
                                <Icon name="close-outline" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 10,
        paddingVertical:20,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: 'black',
    },
    iconContainer: {
        marginLeft: 10,
    },
    scrollViewContent: {
        padding: 10,
    },
    section: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    historySection: {
        marginVertical: 10,
    },
    historyTitle: {
        fontSize: 18,
        marginBottom: 5,
        color: 'black',
    },
    historyItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 5,
    },
    historyItem: {
        flex: 1,
        padding: 5,
    },
    historyText: {
        fontSize: 16,
        color: 'black',
    },
    deleteIcon: {
        padding: 5,
    },
});

export default SearchScreen;
