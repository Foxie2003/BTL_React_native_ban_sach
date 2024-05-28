import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { APIsURL, ImagesURL, formatPrice } from './Constants';

const HomeScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize] = useState(10);
    const [maxPage, setMaxPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBooks();
    }, [pageNum]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${APIsURL}/api/books?pageNum=${pageNum}&pageSize=${pageSize}&query=${searchQuery}`);
            setBooks(response.data.books);
            setMaxPage(response.data.maxPage);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = () => {
        setPageNum(1); // Reset to the first page
        fetchBooks();
    };

    const renderCategory = (categoryTitle, books) => (
        <View style={{marginTop: 10,}}>
            <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{categoryTitle}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {books.map((item) => (
                        <TouchableOpacity key={item.BookID} style={styles.bookItem} onPress={() => navigation.navigate('BookDetail', { book: item })}>
                            <Image source={{ uri: ImagesURL + "/" + item.CoverImageURL }} style={styles.bookImage} />
                            <Text style={styles.bookTitle} numberOfLines={2} ellipsizeMode="tail">{item.Title}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.bookDiscountPrice}>{formatPrice(item.Price - (item.Price * item.Discount / 100))}</Text>
                                <View style={styles.bookDiscountContainer}>
                                    <Text style={styles.bookDiscount}>-{item.Discount}%</Text>
                                </View>
                            </View>
                            <Text style={styles.bookPrice}>{formatPrice(item.Price)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={[styles.container, {alignItems: 'center', padding: 10}]}>
                    <TouchableOpacity style={styles.loadMoreButton} onPress={() => setPageNum(pageNum + 1)}>
                        <Text style={styles.loadMoreText}>Xem thêm</Text>
                    </TouchableOpacity>
                </View>
        </View>
        
    );

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: ImagesURL + "/fahasa-logo.png" }} style={styles.logo} />
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 10 }}>
                    <Icon name="grid-outline" size={40} color="black" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sách"
                        placeholderTextColor="#888888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity onPress={handleSearch}>
                        <Icon name="search-outline" size={25} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bodyContainer}>
                {renderCategory('Tất cả sản phẩm', books)}
                {renderCategory('Thiếu Nhi', books)}
                {renderCategory('Giáo Khoa - Tham Khảo', books)}
                {renderCategory('Văn Học', books)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    logo: {
        width: "100%",
        height: 40,
        marginTop: 10,
        resizeMode: "contain",
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
        padding: 5,
    },
    searchInput: {
        flex: 1,
        color: "#000",
        paddingHorizontal: 10,
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#f8f6f0',
    },
    categoryContainer: {
        backgroundColor: '#fff'
    },
    categoryTitle: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        padding: 10,
    },
    bookItem: {
        width: 200,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    bookImage: {
        width: '100%',
        height: 150,
        borderRadius: 5,
        resizeMode: "contain",
    },
    bookTitle: {
        fontSize: 14,
        color: "#000",
        fontWeight: '600',
        marginTop: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookDiscountPrice: {
        textAlign: 'center',
        fontSize: 18,
        color: '#C92127',
        fontWeight: 'bold',
    },
    bookPrice: {
        fontSize: 14,
        color: '#888888',
        textDecorationLine: 'line-through'
    },
    bookDiscountContainer: {
        backgroundColor: '#C92127',
        height: 40,
        marginLeft: 5,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        borderRadius: 5,
    },
    bookDiscount: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        backgroundColor: '#C92127'
    },
    loadMoreButton: {
        paddingVertical: 10,
        paddingHorizontal: 40,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#d9534f',
        alignItems: 'center',
    },
    loadMoreText: {
        color: '#d9534f',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
