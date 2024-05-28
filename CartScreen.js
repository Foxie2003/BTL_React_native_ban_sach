import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { APIsURL, ImagesURL, formatPrice } from './Constants';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    setSelectAll(cartItems.length > 0 && selectedItems.length === cartItems.length);
  }, [selectedItems, cartItems]);

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
    setSelectedItems(updatedCartItems.filter(item => selectedItems.includes(item.BookID)));
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

  const toggleSelectItem = (item) => {
    if (selectedItems.includes(item.BookID)) {
      setSelectedItems(selectedItems.filter(id => id !== item.BookID));
    } else {
      setSelectedItems([...selectedItems, item.BookID]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.BookID));
    }
    setSelectAll(!selectAll);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.BookID)) {
        return total + item.Price * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleCheckout = async () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.BookID));
    const total = calculateTotal();
    const userID = 1; // Thay đổi ID người dùng theo thực tế
    const status = 'Pending'; // Thay đổi trạng thái đơn hàng theo thực tế

    const cartItemsForAPI = selectedCartItems.map(item => ({
        BookID: item.BookID,
        quantity: item.quantity,
        Price: item.Price
    }));

    try {
        const response = await fetch(`${APIsURL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID,
                total,
                status,
                cartItems: cartItemsForAPI
            }),
        });

        if (response.ok) {
            Alert.alert('Success', 'Checkout successful');
            const remainingItems = cartItems.filter(item => !selectedItems.includes(item.BookID));
            setCartItems(remainingItems);
            setSelectedItems([]);
            await AsyncStorage.setItem('cart', JSON.stringify(remainingItems));
        } else {
            Alert.alert('Error', 'Checkout failed');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity onPress={() => toggleSelectItem(item)}>
        <Icon
          name={selectedItems.includes(item.BookID) ? "checkbox-outline" : "square-outline"}
          size={25}
          color="#C92127"
        />
      </TouchableOpacity>
      <Image source={{ uri: ImagesURL + "/" + item.CoverImageURL }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemTitle}>{item.Title}</Text>
        <Text style={styles.cartItemPrice}>{formatPrice(item.Price)}</Text>
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
