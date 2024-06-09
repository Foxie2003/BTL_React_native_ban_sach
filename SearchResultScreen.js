import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { APIsURL } from './Constants';

const SearchResultScreen = () => {
    const route = useRoute();
    const { searchQuery } = route.params;
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`${APIsURL}/api/books/search?title=${searchQuery}&pageNum=1&pageSize=20`);
                setBooks(response.data.books);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.title}>{item.Title}</Text>
            <Text>{item.Price}</Text>
            {/* Add more details about the book here */}
        </View>
    );

    return (
        <FlatList
            data={books}
            renderItem={renderItem}
            keyExtractor={(item) => item.BookID.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
    },
    itemContainer: {
        flex: 1,
        margin: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SearchResultScreen;
