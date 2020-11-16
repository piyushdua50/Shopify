import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import ShopNavigator from './ShopNavigator';

const NavigationContainer = (props) => {

    const navRef = useRef();

    const isAuth = useSelector(state => !!state.auth.token);  // !! always returns boolean value 

    useEffect(() => {
        // console.log("+++++++++++", navRef.current);
        if (!isAuth) {
            navRef.current.dispatch(NavigationActions.navigate({ routeName: 'Auth' }));
            //To switch to different route from outside the Navigator
        }
    }, [isAuth]);

    return <ShopNavigator ref={navRef} />
};

export default NavigationContainer;