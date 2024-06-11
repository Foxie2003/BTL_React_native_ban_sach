import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import React, { useState } from 'react';
import { APIsURL, ImagesURL, formatPrice } from './Constants';
import firebase from './firebaseConfig';
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
const axios = require('axios');

const verifyEmail = async (email) => {// Thay thế bằng API key của bạn
    const url = `https://api.zerobounce.net/v2/validate?api_key=AIzaSyAFlSfaC_s0uMQoBzs_7B3WExXi0E6a3A0&email=${email}`;

    try {
        const response = await fetch(url);
        const textResponse = await response.text(); // Lấy phản hồi dưới dạng text

        // Thử parse JSON từ text response
        try {
            const data = JSON.parse(textResponse);
            if (data.status === 'valid') {
                return true; // Email hợp lệ
            } else {
                return false; // Email không hợp lệ
            }
        } catch (jsonError) {
            return false;
        }
    } catch (error) {
        console.error('Error verifying email: ', error);
        return false;
    }
};

const SignUpTestFn = async (email, pass, pass2) => {
    try {
        if (email === '' || pass === "" || pass2 === '') {
            Alert.alert('Bạn phải nhập đầy đủ thông tin');
            return;
        }
        if (pass !== pass2) {
            Alert.alert('Mật khẩu không trùng khớp');
            return;
        }

        const userCredential = await auth().createUserWithEmailAndPassword(email, pass2);

        const apiUrl = APIsURL + '/signup'; // Địa chỉ của API endpoint
        const userID = userCredential.user.uid;

        // Dữ liệu JSON chứa thông tin tài khoản
        const data = {
            email1: email,
            password: pass2,
            id: userID
        };

        // Tạo options cho fetch request
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Chuyển đối tượng data thành chuỗi JSON
        };

        const response = await fetch(apiUrl, options);

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const responseData = await response.json();
                console.log('Response:', responseData); // Log response từ máy chủ
                Alert.alert("User created");
            } else {
                console.error('Error:', response.statusText); // Log lỗi từ máy chủ
                // Xử lý lỗi không phải là JSON ở đây
            }
        } else {
            console.error('Error:', response.statusText); // Log lỗi từ máy chủ
            // Xử lý lỗi không phải là 200 OK ở đây
        }


    } catch (error) {
        console.error('Error:', error.message); // Log lỗi nếu có
        Alert.alert('Tài khoản đã tồn tại hoặc không hợp lệ');
    }
    // const apiUrl = APIsURL + '/signup'; // Địa chỉ của API endpoint
    //     const userID = "1243";

    //     // Dữ liệu JSON chứa thông tin tài khoản
    //     const data = {
    //         email1: email,
    //         password: pass2,
    //         id: userID
    //     };

    //     // Tạo options cho fetch request
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data), // Chuyển đối tượng data thành chuỗi JSON
    //     };

    //     const response = await fetch(apiUrl, options);

    //     if (response.ok) {
    //         const contentType = response.headers.get('content-type');
    //         if (contentType && contentType.includes('application/json')) {
    //             const responseData = await response.json();
    //             console.log('Response:', responseData); // Log response từ máy chủ
    //             Alert.alert("User created");
    //         } else {
    //             console.error('Error:', response.statusText); // Log lỗi từ máy chủ
    //             // Xử lý lỗi không phải là JSON ở đây
    //         }
    //     } else {
    //         console.error('Error:', response.statusText); // Log lỗi từ máy chủ
    //         // Xử lý lỗi không phải là 200 OK ở đây
    //     }
};


const App = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confimpassword, setconfimPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State để quản lý việc hiển thị mật khẩu


    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={{ uri: ImagesURL + '/logo.png' }}
                style={styles.logo}
            />
            <Text style={styles.title}>Đăng ký</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#666" // Color for placeholder text
                    keyboardType="email-address"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Mật khẩu"
                        placeholderTextColor="#666" // Color for placeholder text
                        secureTextEntry={!showPassword} // Sử dụng state để điều khiển việc hiển thị mật khẩu
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Image
                            source={showPassword ? require('./hide.png') : require('./eye.png')}
                            style={styles.eyeImage}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Xác nhận lại mật khẩu"
                        placeholderTextColor="#666" // Sử dụng state để điều khiển việc hiển thị mật khẩu
                        value={confimpassword}
                        secureTextEntry={true}
                        onChangeText={setconfimPassword}
                    />

                </View>
                <TouchableOpacity style={styles.blackButton} onPress={() => SignUpTestFn(phoneNumber, password, confimpassword)}>
                    <Text style={styles.buttonText}>Đăng ký</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.signupText}>
                Bạn đã có tài khoản?{' '}
                <Text style={styles.signupLink}>Đăng nhập</Text>
            </Text>
            {/* <TouchableOpacity style={styles.redButton} onPress={handleGoogleLogin}>
                <Text style={styles.buttonText}>Đăng nhập bằng Google</Text>
            </TouchableOpacity> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fff', // Layout background màu trắng
    },
    logo: {
        width: 300,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginTop: 50,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#000', // Title text color
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        // marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        color: '#000', // Input text màu đen
        backgroundColor: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    passwordInput: {
        flex: 1,
        height: 40,
        color: '#000', // Password text màu đen
    },
    eyeIcon: {
        padding: 5,
    },
    eyeImage: {
        width: 20,
        height: 20,
    },
    signupText: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 16,
        color: '#000',
    },
    signupLink: {
        color: 'blue', // Link "Đăng ký" màu xanh
        textDecorationLine: 'underline',
    },
    redButton: {
        backgroundColor: 'red', // Button màu đỏ
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 16,
    },
    blackButton: {
        backgroundColor: 'black', // Button màu đen
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff', // Text màu trắng trên button
        fontSize: 16,
    },
});

export default App;
AppRegistry.registerComponent(appName, () => App);
