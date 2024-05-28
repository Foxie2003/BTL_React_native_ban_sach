import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagesURL, formatPrice } from './Constants';

const BookDetailScreen = ({ route, navigation }) => {
  const { book } = route.params;
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      const cartItems = cart ? JSON.parse(cart) : [];

      const itemIndex = cartItems.findIndex(item => item.BookID === book.BookID);
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity += quantity;
      } else {
        cartItems.push({ ...book, quantity });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      Alert.alert('Success', 'Thêm sản phẩm vào giỏ hàng thành công!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={35} color="white" />
        </TouchableOpacity>
        <View style={styles.navIcons}>
          <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => navigation.navigate('Cart')}>
            <Icon name="cart-outline" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="ellipsis-horizontal-outline" size={35} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: ImagesURL + "/" + book.CoverImageURL }} style={styles.bookImage} />
        <View style={{padding: 10, backgroundColor: '#fff'}}>
          <Text style={styles.bookTitle}>{book.Title}</Text>
          <View style={styles.priceContainer}>
              <Text style={styles.bookDiscountPrice}>{formatPrice(book.Price - (book.Price * book.Discount / 100))}</Text>
              <View style={styles.bookDiscountContainer}>
                  <Text style={styles.bookDiscount}>-{book.Discount}%</Text>
              </View>
              <Text style={styles.bookPrice}>{formatPrice(book.Price)}</Text>
          </View>
        </View>
        {/* Phần thông tin sản phẩm bắt đầu ở đây */}
        <View style={styles.productInfoContainer}>
          <Text style={styles.productInfoTitle}>THÔNG TIN SẢN PHẨM</Text>
          <View style={{paddingHorizontal: 10}}>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Tác giả</Text>
              <Text style={styles.productInfoValue}>{book.Author}</Text>
            </View>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Nhà xuất bản</Text>
              <Text style={styles.productInfoValue}>{book.Publisher}</Text>
            </View>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Kích thước</Text>
              <Text style={styles.productInfoValue}>{book.Size}</Text>
            </View>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Số trang</Text>
              <Text style={styles.productInfoValue}>{book.NumberOfPages}</Text>
            </View>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Năm xuất bản</Text>
              <Text style={styles.productInfoValue}>{book.PublishedDate}</Text>
            </View>
            <View style={styles.productInfoRow}>
              <Text style={styles.productInfoLabel}>Kho</Text>
              <Text style={styles.productInfoValue}>{book.Stock}</Text>
            </View>
            <Text style={styles.productTitleDescription}>{book.Title}</Text>
            <Text style={styles.productDescription}>{book.Description}</Text>
          </View>
        </View>
        {/* Kết thúc phần thông tin sản phẩm */}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
          <Icon name="remove" size={25} color="white" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
          <Icon name="add" size={25} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
          <Text style={styles.cartButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#C92127',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 60, // Để tránh nội dung bị che bởi thanh navigation
    paddingBottom: 80, // Để tránh nội dung bị che bởi thanh navigation dưới cùng
    backgroundColor: '#f8f6f0',
  },
  bookImage: {
    width: '100%',
    height: 300,
    borderRadius: 5,
    resizeMode: "contain",
    backgroundColor: '#fff',
  },
  bookTitle: {
    color: '#000',
    fontSize: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookDiscountPrice: {
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
      marginHorizontal: 5,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      borderRadius: 5,
  },
  bookDiscount: {
      fontSize: 14,
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: '#C92127'
  },
  productInfoContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f8f6f0',
    backgroundColor: '#fff',
  },
  productInfoTitle: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#f8f6f0',
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  productInfoLabel: {
    width: '40%',
    fontSize: 16,
    color: '#333',
  },
  productInfoValue: {
    width: '60%',
    fontSize: 16,
    color: '#555',
  },
  productTitleDescription: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    textAlign: 'justify',
    fontSize: 16,
    color: '#555',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f8f6f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  quantityButton: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C92127',
    padding: 10,
    borderRadius: 5,
  },
  quantity: {
    width: '10%',
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  cartButton: {
    width: '40%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#C92127',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  cartButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  buyButton: {
    width: '30%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    padding: 15,
    borderRadius: 5,
  },
  buyButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BookDetailScreen;
