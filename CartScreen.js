import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagesURL } from './Constants';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('cart');
      const items = jsonValue != null ? JSON.parse(jsonValue) : [];
      setCartItems(items);
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromCart = async (itemToRemove) => {
    const updatedCartItems = cartItems.filter(item => item.BookID !== itemToRemove.BookID);
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
  };

  const increaseQuantity = async (itemToUpdate) => {
    const updatedCartItems = cartItems.map(item =>
      item.BookID === itemToUpdate.BookID ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
  };

  const decreaseQuantity = async (itemToUpdate) => {
    if (itemToUpdate.quantity > 1) {
      const updatedCartItems = cartItems.map(item =>
        item.BookID === itemToUpdate.BookID ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCartItems(updatedCartItems);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: ImagesURL + "/" + item.CoverImageURL }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemTitle}>{item.Title}</Text>
        <Text style={styles.cartItemPrice}>${item.Price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => decreaseQuantity(item)}>
            <Icon name="remove-circle-outline" size={25} color="#C92127" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQuantity(item)}>
            <Icon name="add-circle-outline" size={25} color="#C92127" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item)}>
        <Icon name="trash-outline" size={30} color="#C92127" />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
      <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
    </TouchableOpacity>
  );

  const handleCheckout = () => {
    Alert.alert('Checkout', 'Proceeding to checkout');
    // Implement checkout functionality here
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.BookID.toString()}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#888',
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  checkoutButton: {
    padding: 15,
    backgroundColor: '#C92127',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 80, // Để tránh nội dung bị che bởi thanh navigation dưới cùng
  },
});

export default CartScreen;
