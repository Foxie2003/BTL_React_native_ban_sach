import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'react-native-elements';
import { APIsURL, ImagesURL, formatPrice } from './Constants';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const ProductScreen = ({ route }) => {
    const { userID, total, status, cartItems } = route.params;

    const [showDetails, setShowDetails] = useState(true);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [dc, setDC] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            setLoadingProvinces(true);
            const response = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
            const data = await response.json();
            setProvinces(data);
            setLoadingProvinces(false);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            setLoadingProvinces(false);
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            setLoadingDistricts(true);
            const provinceData = provinces.find(prov => prov.Id === provinceId);
            setDistricts(provinceData.Districts);
            setLoadingDistricts(false);
        } catch (error) {
            console.error('Error fetching districts:', error);
            setLoadingDistricts(false);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            setLoadingWards(true);
            const districtData = districts.find(dist => dist.Id === districtId);
            setWards(districtData.Wards);
            setLoadingWards(false);
        } catch (error) {
            console.error('Error fetching wards:', error);
            setLoadingWards(false);
        }
    };

    const handleProvinceChange = (value) => {
        setProvince(value);
        setDistrict('');
        setWard('');
        if (value) {
            fetchDistricts(value);
        } else {
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = (value) => {
        setDistrict(value);
        setWard('');
        if (value) {
            fetchWards(value);
        } else {
            setWards([]);
        }
    };

    const getUserID = async () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = auth().onAuthStateChanged(user => {
                if (user) {
                    resolve(user.uid);
                } else {
                    reject("User not logged in");
                }
                unsubscribe();
            });
        });
    };

    const handlePayment = async () => {
        try {
            const products = cartItems.map(item => ({
                id: item.id,
                so_luong: item.quantity,
            }));
            
            const userID2 = await getUserID();
    
            // Lấy tên của tỉnh, huyện, xã từ các danh sách
            const provinceName = provinces.find(prov => prov.Id === province)?.Name || '';
            const districtName = districts.find(dist => dist.Id === district)?.Name || '';
            const wardName = wards.find(w => w.Id === ward)?.Name || '';
            const token = await messaging().getToken();
            const payload = {
                id_taikhoan: userID2,
                ten_khach_hang: name,
                token: token,
                sdt: phone,
                dia_chi: `${dc}, ${wardName}, ${districtName}, ${provinceName}`,
                tinh_trang_don_hang: status,
                san_pham: products,
            };
    
            const response = await fetch(`${APIsURL}/thanhtoan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert('Đơn hàng của bạn đã được hoàn tất');
                const storedCart = await AsyncStorage.getItem('cart');
                let cart = storedCart ? JSON.parse(storedCart) : [];
    
                // Xóa các sản phẩm trong cartItems khỏi giỏ hàng
                cart = cart.filter(cartItem => !cartItems.some(item => item.id === cartItem.id));
                console.log('Cart: ' + cart);
                await AsyncStorage.setItem('cart', JSON.stringify(cart)); // Cập nhật giỏ hàng trong AsyncStorage
            } else {
                alert(`Có lỗi xảy ra: ${result.error}`);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Có lỗi xảy ra khi xử lý thanh toán.');
        }
    };
    

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Đơn hàng</Text>
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
                <Text style={styles.toggleText}>{showDetails ? 'Ẩn thông tin đơn hàng' : 'Hiện thông tin đơn hàng'}</Text>
            </TouchableOpacity>
            {showDetails && (
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.product}>
                            <Image style={{ width: 80, height: 80 }} source={{ uri: ImagesURL + '/' + item.image }} />
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                                <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
            <Text style={{ color: 'black', alignSelf: 'center', fontSize: 20, }}>Tổng đơn hàng: <Text style={{ color: 'black', fontWeight: 'bold' }}>{formatPrice(total)}</Text></Text>

            <View style={styles.separator} />

            <Text style={styles.label}>Thông tin giao hàng</Text>
            <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                placeholderTextColor={"#7D7C7B"}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                keyboardType='phone-pad'
                placeholder="Số điện thoại"
                value={phone}
                placeholderTextColor={"#7D7C7B"}
                onChangeText={setPhone}
            />

            <View style={styles.pickerContainer}>
                {loadingProvinces ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Picker
                        selectedValue={province}
                        style={styles.picker}
                        onValueChange={handleProvinceChange}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Chọn tỉnh / thành" value="" />
                        {provinces.map((prov) => (
                            <Picker.Item key={prov.Id} label={prov.Name} value={prov.Id} />
                        ))}
                    </Picker>
                )}
            </View>

            <View style={styles.pickerContainer}>
                {loadingDistricts ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Picker
                        selectedValue={district}
                        style={styles.picker}
                        onValueChange={handleDistrictChange}
                        enabled={province !== ''}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Chọn quận / huyện" value="" />
                        {districts.map((dist) => (
                            <Picker.Item key={dist.Id} label={dist.Name} value={dist.Id} />
                        ))}
                    </Picker>
                )}
            </View>

            <View style={styles.pickerContainer}>
                {loadingWards ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Picker
                        selectedValue={ward}
                        style={styles.picker}
                        onValueChange={(value) => setWard(value)}
                        enabled={district !== ''}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Chọn xã / phường" value="" />
                        {wards.map((ward) => (
                            <Picker.Item key={ward.Id} label={ward.Name} value={ward.Id} />
                        ))}
                    </Picker>
                )}
            </View>
            <TextInput
                style={styles.input}
                placeholder="Địa chỉ cụ thể"
                value={dc}
                placeholderTextColor={"#7D7C7B"}
                onChangeText={setDC}
            />
            <View style={styles.separator} />

            <Text style={styles.label}>Phương thức thanh toán</Text>
            <TouchableOpacity style={styles.paymentMethod}>
                <Text style={styles.paymentText}>Thanh toán khi giao hàng (COD)</Text>
            </TouchableOpacity>

            <Button title="Hoàn tất đơn hàng" onPress={handlePayment} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    header: {
        color: 'black',
        alignSelf: 'center',
        fontSize: 25,
        fontWeight: 'bold',
    },
    toggleText: {
        color: 'red',
        marginBottom: 16,
        textAlign: 'center',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 16,
    },
    picker: {
        height: 50,
        color: 'black',
    },
    pickerItem: {
        color: 'black',
    },
    product: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productDetails: {
        flex: 1,
        marginLeft: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    productPrice: {
        fontSize: 14,
        color: 'black',
    },
    productQuantity: {
        fontSize: 14,
        color: 'black',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 16,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'black',
        fontSize: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        color: 'black',
        marginBottom: 16,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 16,
    },
    paymentText: {
        color: 'black',
    },
});

export default ProductScreen;
