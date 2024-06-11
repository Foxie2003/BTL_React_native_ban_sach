import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import React, { useState,useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import auth from '@react-native-firebase/auth'
import { APIsURL, ImagesURL, formatPrice } from './Constants';
const App = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State để quản lý việc hiển thị mật khẩu
    const navigation = useNavigation();
    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(user => {
            if (user) {
                // Người dùng đã đăng nhập
                console.log('User đã đăng nhập:', user.uid);
                // Thực hiện các hành động cần thiết sau khi đăng nhập, chẳng hạn chuyển hướng đến màn hình chính
                navigation.navigate('Home');
            } else {
                // Không có người dùng đăng nhập
                console.log('Không có người dùng đăng nhập');
            }
        });

        return unsubscribe; // Dừng lắng nghe khi component unmount
    }, []);
    const handleLogin = () => {
        // Xử lý logic đăng nhập ở đây
        if (phoneNumber === '' || password === '') {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        } else {
            auth().signInWithEmailAndPassword(phoneNumber,password)
            .then((res)=> 
                {
                    console.log(res);
                 Alert.alert('Thông báo', 'Đăng nhập thành công');
                 navigation.navigate('Home');
                }
            )
            .catch((err)=> console.log(err))
            
        }
    };

    const handleGoogleLogin = () => {
        // Xử lý logic đăng nhập bằng Google ở đây
        Alert.alert('Thông báo', 'Đăng nhập bằng Google');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={{ uri:ImagesURL+ '/logo.png' }}
                style={styles.logo}
            />
            <Text style={styles.title}>Đăng nhập</Text>
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
                <TouchableOpacity style={styles.blackButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.signupText}>
                Bạn chưa có tài khoản?{' '}
                <Text style={styles.signupLink} onPress={()=> navigation.navigate('Register')}>Đăng ký</Text>
            </Text>
            {/* <TouchableOpacity style={styles.redButton} onPress={handleGoogleLogin}> */}
                {/* <Text style={styles.buttonText}>Đăng nhập bằng Google</Text> */}
            {/* </TouchableOpacity> */}
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
        width: 310,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginTop:50,
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
        marginBottom: 12,
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
