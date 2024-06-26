import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { APIsURL, ImagesURL, formatPrice, UserId } from './Constants';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchCartItems = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('cart');
      const items = jsonValue != null ? JSON.parse(jsonValue) : [];
      setCartItems(items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    setSelectAll(cartItems.length > 0 && selectedItems.length === cartItems.length);
  }, [selectedItems, cartItems]);

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  const removeFromCart = async (itemToRemove) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemToRemove.id);
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
    setSelectedItems(updatedCartItems.filter(item => selectedItems.includes(item.id)));
  };

  const increaseQuantity = async (itemToUpdate) => {
    const updatedCartItems = cartItems.map(item =>
      item.id === itemToUpdate.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCartItems);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
  };

  const decreaseQuantity = async (itemToUpdate) => {
    if (itemToUpdate.quantity > 1) {
      const updatedCartItems = cartItems.map(item =>
        item.id === itemToUpdate.id ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCartItems(updatedCartItems);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCartItems));
    }
  };

  const toggleSelectItem = (item) => {
    if (selectedItems.includes(item.id)) {
      setSelectedItems(selectedItems.filter(id => id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item.id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.id)) {
        return total + item.gia * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleCheckout = async () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const total = calculateTotal();
    var userID = ""; // Thay đổi ID người dùng theo thực tế
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        userID = user.uid;
      }});
    const status = 'Pending'; // Thay đổi trạng thái đơn hàng theo thực tế
    const cartItemsForAPI = selectedCartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.gia,
      image: item.anh_dai_dien,
      name: item.ten_sp
    }));
    navigation.navigate('ThanhToan', {
      userID,
      total,
      status,
      cartItems: cartItemsForAPI
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity onPress={() => toggleSelectItem(item)}>
        <Icon
          name={selectedItems.includes(item.id) ? "checkbox-outline" : "square-outline"}
          size={25}
          color="#C92127"
        />
      </TouchableOpacity>
      <Image source={{ uri: ImagesURL + "/" + item.anh_dai_dien }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemTitle}>{item.ten_sp}</Text>
        <Text style={styles.cartItemPrice}>{formatPrice(item.gia)}</Text>
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={35} color="white" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>
    </View>
  );

  const checkboxSelectAll = () => {
    const selectedCount = selectedItems.length;
    const cartItemCount = cartItems.length;
    const isAllSelected = selectedCount === cartItemCount;
    return (
      <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
        <Icon
          name={isAllSelected ? "checkbox-outline" : "square-outline"}
          size={25}
          color="#C92127"
        />
        <Text style={styles.selectAllButtonText}>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => (
    <View style={{margin: 10}}>
      <Text style={styles.totalPriceText}>Tổng tiền: {formatPrice(calculateTotal())}</Text>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {checkboxSelectAll()}
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#C92127',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
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
    color: '#000',
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
    color: '#000',
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
  selectAllButton: {
    flexDirection: 'row', // Sắp xếp các phần tử theo hàng ngang
    alignItems: 'center', // Canh chỉnh các phần tử theo chiều dọc
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 10,
  },
  selectAllButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 10,
  },
  totalPriceText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CartScreen;
