import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    const handleSearch = async () => {
        // Navigate to the SearchResultScreen and pass the searchQuery
        navigation.navigate('SearchResult', { searchQuery });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Cặp chống gù Tiger cho bé"
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
                    <View style={styles.historyItem}>
                        <Text style={styles.historyText}>góc nhỏ có nắng</Text>
                    </View>
                </View>

                <View style={styles.popularSearchesSection}>
                    <Text style={styles.popularSearchesTitle}>Tìm kiếm phổ biến</Text>
                    <View style={styles.popularSearches}>
                        {/* Add popular search items here */}
                    </View>
                </View>

                <View style={styles.featuredCategoriesSection}>
                    <Text style={styles.featuredCategoriesTitle}>Danh mục nổi bật</Text>
                    <View style={styles.featuredCategories}>
                        {/* Add featured category items here */}
                    </View>
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
        backgroundColor: '#ff0000',
        padding: 10,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
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
    },
    historyItem: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 5,
    },
    historyText: {
        fontSize: 16,
    },
    popularSearchesSection: {
        marginVertical: 10,
    },
    popularSearchesTitle: {
        fontSize: 18,
        marginBottom: 5,
    },
    popularSearches: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featuredCategoriesSection: {
        marginVertical: 10,
    },
    featuredCategoriesTitle: {
        fontSize: 18,
        marginBottom: 5,
    },
    featuredCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

export default SearchScreen;
