import { AsyncStorage } from 'react-native';
// export const SIGNUP = 'SIGNUP';
// export const LOGIN = 'LOGIN';
export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';

let timer;

export const Authenticate = (userId, token, expiryTime) => {
    return dispatch => {
        dispatch(setLogoutTimer(expiryTime));
        // console.log("After Authenticate---------");
        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token
        })
    }
};

export const signup = (email, password) => {
    return async dispatch => {
        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB6Nzg2rInAwxzjrbF1RuHfPlXzfDBxFmo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });

        if (!response.ok) {
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!';
            if (errorId === 'EMAIL_EXISTS') {
                message = 'This Email already Exists!';
            }
            throw new Error(message);
        };

        const resData = await response.json();
        // console.log(resData, '----------------------');
        dispatch(Authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000));
        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000);
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
    }
};

export const login = (email, password) => {
    return async dispatch => {
        const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6Nzg2rInAwxzjrbF1RuHfPlXzfDBxFmo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });

        if (!response.ok) {
            const errorResData = await response.json();
            // console.log("+++++++++++++++++++++++++", errorResData);
            const errorId = errorResData.error.message;
            let message = 'Something went wrong!';
            if (errorId === 'EMAIL_NOT_FOUND') {
                message = 'This Email could not found!';
            } else if (errorId === 'INVALID_PASSWORD') {
                message = 'This Password is not valid!';
            }
            throw new Error(message);
        };

        const resData = await response.json();
        // console.log(resData, '+++++++++++++++++++++++');
        // dispatch({
        //     type: LOGIN,
        //     token: resData.idToken,
        //     userId: resData.localId
        // });
        dispatch(Authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000));
        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000);
        // console.log("Hiii", parseInt(resData.expiresIn));
        // console.log("Expiration Date ------------", expirationDate.toISOString());
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
    }
};

export const logout = () => {
    clearLogoutTimer();
    AsyncStorage.removeItem('userData');
    return { type: LOGOUT }
};

const clearLogoutTimer = () => {
    if (timer) {
        //console.log("Timer is: ", timer);
        clearTimeout(timer);
    }
}

const setLogoutTimer = (expirationTime) => {
    // console.log("Expiry Time: ", expirationTime);
    return dispatch => {
        timer = setTimeout(() => {
            dispatch(logout())     // dispatch(logout()) is called after the expirationTime is completed
        }, expirationTime / 60);
    }
}

// JSON.stringify() converts a js object into string
const saveDataToStorage = (token, userId, expirationDate) => {
    AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expirationDate.toISOString()   // To convert Date into String
    }))
};