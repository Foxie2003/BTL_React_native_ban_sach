import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { APIsURL, ImagesURL, formatPrice } from './Constants';
import { Header, Card, Button, Tile } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';

const SearchResultScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { searchQuery } = route.params;
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [sx, setSX] = useState(0);
    const [maxPage, setMaxPage] = useState(1);
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(100);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    const bannerRef = useRef(null);

    const [bannerIndex, setBannerIndex] = useState(0);
    const bannerImages = [
        "https://theme.hstatic.net/1000111569/1001042649/14/slide_index_1.jpg?v=23",
        "https://images.toplist.vn/images/800px/khan-phu-kien-730304.jpg",
        "https://scontent.fhph1-3.fna.fbcdn.net/v/t39.30808-6/353650114_630293449120475_2149482746043363141_n.png?stp=c0.5000x0.5000f_dst-png_e15_p1865x745_q60_tt1_u&efg=eyJ1cmxnZW4iOiJ1cmxnZW5fZnJvbV91cmwifQ&_nc_cid=0&_nc_ad=z-m&_nc_rml=0&_nc_ht=scontent.fhph1-3.fna&_nc_cat=103&_nc_ohc=ZqpmwCTuI1kQ7kNvgGgHS0c&ccb=1-7&_nc_sid=5f2048&oh=00_AYA9Pzw4_eJanBHZQDJ0qrq68GTg5iAZUzcxsArHS4mjZg&oe=666C2804",
    ];
    
    useEffect(() => {
        if (bannerRef.current) {
            bannerRef.current.scrollToIndex({ index: bannerIndex, animated: true });
        }
        const intervalId = setInterval(() => {
            setBannerIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [bannerIndex]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`${APIsURL}/timkiem`, {
                    params: {
                        name: searchQuery,
                        minPrice,
                        maxPrice,
                        pageNumber: pageIndex,
                        pageSize: 5,
                        sortOrder: sx
                    }
                });
                const data = response.data;
                setBooks(data.products);
                setMaxPage(data.maxPage);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery, pageIndex]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }
    
    const handleNext = () => {
        if (pageIndex < maxPage) {
            setPageIndex(pageIndex + 1);
        }
    };

    const handleBack = () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles2.product} onPress={() => navigation.navigate('BookDetailStackNavigator', { screen: 'BookDetail', params: { id: item.id } })}>
            <View>
                <View style={styles2.discountBadge}>
                    <Text style={styles2.discountText}>-{((item.gia_ban - item.gia_khuyen_mai) / item.gia_ban * 100).toFixed(0)}%</Text>
                </View>
                <Image source={{ uri: `${ImagesURL}/${item.anh_dai_dien.trim()}` }} style={styles2.productImage} />
                <Card.Divider />
                <Text style={styles2.productName} numberOfLines={1}>{item.id}</Text>
                <Text style={styles2.productName} numberOfLines={1}>{item.ten_sp.length > 30 ? `${item.ten_sp.slice(0, 25)}...` : item.ten_sp}</Text>
                <View style={styles2.priceContainer}>
                    <Text style={styles2.price}>{formatPrice(item.gia_khuyen_mai)}</Text>
                    <Text style={styles2.originalPrice}>{formatPrice(item.gia_ban)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            ListHeaderComponent={
                <>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 10 }}>
                            <Icon name="grid-outline" size={40} color="black" />
                        </TouchableOpacity>
                        <View style={styles.searchContainer}>
                            <TextInput
                                onPress={() => navigation.navigate('Search')}
                                style={styles.searchInput}
                                placeholder="Tìm kiếm tên sản phẩm"
                                placeholderTextColor="#888888"
                                value={searchQuery}
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
                    <Text style={{ color: 'black', alignSelf: 'center', fontWeight: 'bold', fontSize: 20 }}>Danh sách các sản phẩm</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={sx}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSX(itemValue)}
                        >
                            <Picker.Item label="Giá tăng dần" value={1} style={styles.pickerItem} />
                            <Picker.Item label="Giá giảm dần" value={2} style={styles.pickerItem} />
                        </Picker>
                    </View>
                </>
            }
            data={books}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            ListFooterComponent={
                <View style={styles.buttonContainer}>
                    <Button title="<" onPress={handleBack} disabled={pageIndex === 1} buttonStyle={styles.button} />
                    <Text style={styles.pageInfo}>{pageIndex}/{maxPage}</Text>
                    <Button title=">" onPress={handleNext} disabled={pageIndex === maxPage} buttonStyle={styles.button} />
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    pageInfo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginHorizontal: 10,
    },
    button: {
        backgroundColor: 'black',
        marginHorizontal: 10,
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
        borderBlockColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
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
    searchInput: {
        flex: 1,
        color: "#000",
        paddingHorizontal: 10,
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
const styles2 = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    discountBadge: {
        position: 'absolute',
        top: 20,
        right: -10,
        zIndex: 1000,
        backgroundColor: 'red',
        borderRadius: 100,
        padding: 10,
    },
    product: {
        borderRadius: 10,
        position: 'relative',
        width: '45%',
        margin: '2.5%',
        borderColor: '#ddd',
        backgroundColor: '#fff',
        borderWidth: 1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 5,
        paddingRight: 5,
    },
    discountText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    productImage: {
        width: 150,
        height: 150,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        alignSelf: 'center',
    },
    productName: {
        fontSize: 12,
        color: 'black',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        color: 'purple',
        fontSize: 16,
        fontWeight: 'bold',
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        marginLeft: 10,
        color: 'grey',
    },
});

export default SearchResultScreen;
