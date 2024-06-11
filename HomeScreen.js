import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { APIsURL, ImagesURL, formatPrice } from './Constants';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [books, setBooks] = useState([]);
    const [pageNumber, setpageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [sx] = useState(0);
    const [maxPage, setMaxPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [bannerIndex, setBannerIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [booksByCategory, setBooksByCategory] = useState({});
    const bannerRef = useRef(null);

    const bannerImages = [
        "https://cdn0.fahasa.com/media/magentothem/banner7/summersale_resize_mainbanner_840x320.jpg",
        "https://cdn0.fahasa.com/media/magentothem/banner7/DoiTacT524_Slide_840x320.jpg",
        "https://cdn0.fahasa.com/media/magentothem/banner7/MCBookT524_bannerSlide_840x320.jpg",
        "https://cdn0.fahasa.com/media/magentothem/banner7/Silver_0524_Ver1_SachVietSlide_840x320.jpg",
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (bannerRef.current) {
            bannerRef.current.scrollToIndex({ index: bannerIndex, animated: true });
        }
        const intervalId = setInterval(() => {
            setBannerIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [bannerIndex]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${APIsURL}/categories`);
            setCategories(response.data.categories);
            response.data.categories.forEach(category => {
                fetchBooksByCategory(category.MaLoai, 1);
            });
        } catch (error) {
            console.error("fetchCategories: " + error);
        }
    };

    const fetchBooksByCategory = async (categoryID, pageNumber) => {
        try {
            const response = await axios.get(`${APIsURL}/sanphams/loai/${categoryID}`, {
                params: {
                    pageNumber,
                    pageSize,
                    sx
                }
            });

            if(categoryID != 0) {
                setBooksByCategory(prevBooksByCategory => {
                    const updatedCategoryBooks = pageNumber === 1 
                        ? response.data
                        : [...(prevBooksByCategory[categoryID] || []), ...response.data];
                    
                    return {
                        ...prevBooksByCategory,
                        [categoryID]: {
                            books: updatedCategoryBooks
                        }
                    };
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLoadMoreBooks = (categoryID) => {
        const categoryBooks = booksByCategory[categoryID];
        if (categoryBooks.pageNumber < categoryBooks.maxPage) {
            fetchBooksByCategory(categoryID, categoryBooks.pageNumber + 1);
        }
    };

    const renderCategory = (category) => {
        const categoryBooks = booksByCategory[category.MaLoai]?.books || [];
        if(categoryBooks.length != 0) {
            return (
                <View style={{ marginTop: 10 }} key={category.MaLoai}>
                    <View style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{category.TenLoai}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categoryBooks.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.bookItem} onPress={() => navigation.navigate('BookDetailStackNavigator', { screen: 'BookDetail', params: {book: item}})}>
                                    <Image source={{ uri: ImagesURL + "/" + item.anh_dai_dien }} style={styles.bookImage} />
                                    <Text style={styles.bookTitle} numberOfLines={2} ellipsizeMode="tail">{item.ten_sp}</Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.bookDiscountPrice}>{formatPrice(item.gia_ban != null ? item.gia_ban : item.gia)}</Text>
                                        <View style={styles.bookDiscountContainer}>
                                            <Text style={styles.bookDiscount}>-{Math.round(((item.gia - item.gia_ban) / item.gia) * 100)}%</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.bookPrice}>{formatPrice(item.gia)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    {booksByCategory[category.CategoryID] && booksByCategory[category.CategoryID].pageNumber < booksByCategory[category.CategoryID].maxPage && (
                        <View style={[styles.container, { alignItems: 'center', padding: 10 }]}>
                            <TouchableOpacity style={styles.loadMoreButton} onPress={() => handleLoadMoreBooks(category.CategoryID)}>
                                <Text style={styles.loadMoreText}>Xem thêm</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            );
        }
        else {
            return;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: ImagesURL + "/fahasa-logo.png" }} style={styles.logo} />
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 10 }}>
                    <Icon name="grid-outline" size={40} color="black" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <TextInput
                        onPress={() => navigation.navigate('Search')}
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sách"
                        placeholderTextColor="#888888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <Icon name="search-outline" size={25} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bannerContainer}>
                <FlatList
                    data={bannerImages}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={styles.bannerImage} />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    keyExtractor={(item, index) => index.toString()}
                    ref={bannerRef}
                />
            </View>
            <View style={styles.bodyContainer}>
                {categories.map(category => renderCategory(category))}
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
        paddingBottom: 20,
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
    bannerContainer: {
        height: 200,
        marginBottom: 10,
    },
    bannerImage: {
        width: Dimensions.get('window').width,
        height: 200,
        resizeMode: 'cover',
    },
});

export default HomeScreen;
