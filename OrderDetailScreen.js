import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { APIsURL } from './Constants';

const OrderDetailScreen = ({ route }) => {
    const { orderId } = route.params;
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        fetch(`${APIsURL}/api/get-order-details/${orderId}`)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch order details'))
            .then(data => setOrderDetails(data[0]))
            .catch(error => console.error('Lỗi khi gọi API:', error));
    }, [orderId]);

    if (!orderDetails) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Mã đơn hàng: {orderDetails.don_hang_id}</Text>
            <Text style={styles.label}>Tên khách hàng: {orderDetails.ten_khach_hang}</Text>
            <Text style={styles.label}>Số điện thoại: {orderDetails.sdt}</Text>
            <Text style={styles.label}>Địa chỉ: {orderDetails.dia_chi}</Text>
            <Text style={styles.label}>Thời gian tạo: {orderDetails.thoi_gian_tao}</Text>
            <Text style={styles.label}>Tổng tiền: {orderDetails.tong_don_hang}</Text>
            <Text style={styles.label}>Trạng thái đơn hàng: {orderDetails.tinh_trang_don_hang}</Text>
            <Text style={styles.label}>Chi tiết đơn hàng:</Text>
            <FlatList
                data={orderDetails.chi_tiet_don_hang}
                renderItem={({ item }) => (
                    <View style={styles.detailItem}>
                        <Text>Sản phẩm: {item.ten_sp}</Text>
                        <Text>Số lượng: {item.so_luong}</Text>
                        <Text>Giá bán: {item.gia_ban}</Text>
                        <Text>Tổng: {item.tong}</Text>
                    </View>
                )}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailItem: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
});

export default OrderDetailScreen;
