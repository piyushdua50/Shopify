import React, { useEffect } from 'react';
import { View, StyleSheet, AsyncStorage, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import * as authActions from '../store/actions/auth';

import Colors from '../constants/Colors';

const StartupScreen = (props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const tryLogin = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                props.navigation.navigate('Auth');
                return;
            };
            const transformedData = JSON.parse(userData);  // parse method converts a string into Object
            const { token, userId, expiryDate } = transformedData;
            // console.log("Expiration Date is: ", expiryDate);
            const expirationDate = new Date(expiryDate);

            if (expirationDate <= new Date() || !token || !userId) {
                props.navigation.navigate('Auth');
                return;
            };

            props.navigation.navigate('Shop');

            const expirationTime = expirationDate.getTime() - new Date().getTime();
            dispatch(authActions.Authenticate(userId, token, expirationTime));
        }
        tryLogin();
    }, [dispatch]);

    return (
        <View style={styles.screen}>
            <ActivityIndicator size='large' color={Colors.primary} />
        </View>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default StartupScreen;