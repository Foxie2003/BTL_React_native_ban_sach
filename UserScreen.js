import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Button, Modal, Platform, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { APIsURL, ImagesURL } from './Constants';
import auth from '@react-native-firebase/auth';

const ProfileEditScreen = () => {
    const navigation = useNavigation();
    const [id, setId] = useState(null);
    const [ten, setTen] = useState('');
    const [ngaysinh, setNgaysinh] = useState('');
    const [sdt, setSdt] = useState('');
    const [tk, setTk] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(user => {
            if (user) {
                fetch(`${APIsURL}/getUser/${user.uid}`)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Failed to fetch user');
                    })
                    .then(data => {
                        console.log("Fetched user data:", data);
                        const userData = data[0];
                        setId(userData.id);
                        setTen(userData.ten);
                        setNgaysinh(formatDate(userData.ngaysinh));  // Định dạng lại ngày sinh
                        setSdt(userData.sdt);
                        setTk(userData.tk);
                    })
                    .catch(error => {
                        console.error('Lỗi khi gọi API:', error);
                    });
            }
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const phoneNumber = sdt ? sdt : '';
    const visibleDigits = phoneNumber.slice(-2);
    const hiddenDigits = phoneNumber.slice(0, -2).replace(/\d/g, '*');
    const maskedPhoneNumber = hiddenDigits + visibleDigits;

    const handleProfileItemPress = (field, value) => {
        setCurrentField(field);
        setInputValue(value);
        if (field === 'ngaysinh') {
            setShowDatePicker(true);
        } else {
            setModalVisible(true);
        }
    };

    const handleSave = () => {
        if (!validateInput(currentField, inputValue)) {
            alert(`Dữ liệu không hợp lệ cho ${currentField}`);
            return;
        }

        const updatedData = {
            id,
            ten,
            sdt,
            ngaysinh,
            [currentField]: inputValue
        };

        console.log("Update body:", updatedData);

        fetch(`${APIsURL}/updateUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message) });
                }
                return response.json();
            })
            .then(data => {
                if (currentField === 'ten') setTen(inputValue);
                if (currentField === 'sdt') setSdt(inputValue);
                if (currentField === 'ngaysinh') setNgaysinh(inputValue);
                setModalVisible(false);
                setShowDatePicker(false);
            })
            .catch(error => {
                console.error('Lỗi khi cập nhật thông tin:', error);
                alert(`Lỗi khi cập nhật thông tin: ${error.message}`);
            });
    };

    const validateInput = (field, value) => {
        switch (field) {
            case 'ngaysinh':
                console.log("Validating ngaysinh:", value);
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    return !isNaN(value.getTime());
                } else {
                    return /^\d{4}-\d{2}-\d{2}$/.test(value);
                }
            case 'sdt':
                return /^\d{10,15}$/.test(value);
            case 'ten':
                return value.length > 0 && value.length <= 255;
            default:
                return true;
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        const formattedDate = currentDate.toISOString().slice(0, 10);
        setInputValue(formattedDate);
    };

    useEffect(() => {
        if (currentField === 'ngaysinh') {
            handleSave();
        }
        console.log("Input value changed:", inputValue);
    }, [inputValue]);

    if (!id) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: `${ImagesURL}/user.png` }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                <ProfileItem label="Tên" placeholder="Thiết lập ngay" defaultValue={ten} onPress={() => handleProfileItemPress('ten', ten)} />
                <ProfileItem label="Ngày sinh" placeholder="Thiết lập ngay" defaultValue={ngaysinh} onPress={() => handleProfileItemPress('ngaysinh', ngaysinh)} />
                <ProfileItem label="Số điện thoại" placeholder="Thiết lập ngay" defaultValue={maskedPhoneNumber} onPress={() => handleProfileItemPress('sdt', sdt)} />
                <ProfileItem label="Email" placeholder={tk} editable={false} />
                <OrderList userId={id} />
            </View>
            <Button
                onPress={() => {
                    auth().signOut()
                        .then(() => {
                            console.log('Đăng xuất thành công');
                            navigation.navigate('Login');
                        })
                        .catch((error) => {
                            console.error('Lỗi khi đăng xuất:', error);
                        });
                }}
                title='Đăng xuất'
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalLabel}>Nhập {currentField}</Text>
                        {currentField === 'ngaysinh' ? (
                            <Text style={styles.modalInput}>{inputValue}</Text>
                        ) : (
                            <TextInput
                                style={styles.modalInput}
                                value={inputValue}
                                onChangeText={setInputValue}
                                placeholder={currentField === 'ngaysinh' ? 'YYYY-MM-DD' : ''}
                                keyboardType={currentField === 'sdt' ? 'phone-pad' : 'default'}
                            />
                        )}
                        <Button title="Lưu" onPress={handleSave} />
                        <Button title="Hủy" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

const OrderList = ({ userId }) => {
    const [orders, setOrders] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        fetch(`${APIsURL}/api/get-donhang/${userId}`)
            .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch orders'))
            .then(data => setOrders(data))
            .catch(error => console.error('Lỗi khi gọi API:', error));
    }, [userId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.orderItem} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={styles.row}>
                <Text style={styles.label}>Mã đơn hàng:</Text>
                <Text style={styles.value}>{item.id}</Text>
                <Text style={styles.label}>Trạng thái:</Text>
                <Text style={styles.value}>{item.tinh_trang_don_hang}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Tên khách hàng:</Text>
                <Text style={styles.value}>{item.ten_khach_hang}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Thời gian tạo:</Text>
                <Text style={styles.value}>{item.thoi_gian_tao}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Tổng tiền:</Text>
                <Text style={styles.value}>{item.tong_don_hang}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
        />
    );
};

const ProfileItem = ({ label, placeholder, defaultValue, editable = true, verification = false, onPress }) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={editable ? onPress : null}>
                {defaultValue ? (
                    <Text style={styles.value}>{defaultValue}</Text>
                ) : (
                    <Text style={styles.placeholder}>{placeholder}</Text>
                )}
                {verification && <Text style={styles.verify}></Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
    },
    profileImageContainer: {
        height: 100,
        width: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
    },
    body: {
        padding: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 16,
        color: '#7D7C7B',
    },
    value: {
        fontSize: 16,
        color: '#000',
    },
    verify: {
        marginLeft: 10,
        color: '#FF4500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalInput: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
    },
    orderItem: {
        padding: 10,
        marginVertical: 5,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
});

export default ProfileEditScreen;
