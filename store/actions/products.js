import Product from "../../models/product";
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';


export const fetchProduct = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const response = await fetch('https://rn-complete-guide-8bf39.firebaseio.com/products.json', {
        method: 'GET'  // optional for GET Request
      });

      if (!response.ok) {
        throw new Error('Something went wrong!');
      };

      const resData = await response.json();

      const loadedProducts = [];
      for (const key in resData) {
        // console.log(key, "+++++++++++++", resData[key]);
        loadedProducts.push(
          new Product(
            key,
            resData[key].ownerId,
            resData[key].ownerPushToken,
            resData[key].title,
            resData[key].imageUrl,
            resData[key].description,
            resData[key].price));
      };

      dispatch({
        type: SET_PRODUCTS,
        products: loadedProducts,
        userProducts: loadedProducts.filter(prod => prod.ownerId === userId)
      });
    } catch (err) {
      throw err;
    }
  }
};

export const deleteProduct = (productId) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const response = await fetch(`https://rn-complete-guide-8bf39.firebaseio.com/products/${productId}.json?auth=${token}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Something went wrong!');
    };

    dispatch({ type: DELETE_PRODUCT, pid: productId });
  };
};

export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch, getState) => {
    // any async code you want
    let pushToken;
    let statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (statusObj.status !== 'granted') {     // checking whether the permission is already granted or not
      statusObj = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      // Permission not granted, So ask for the Permission.
    }
    // console.log("Status------", statusObj.status);
    if (statusObj.status !== 'granted') {
      pushToken = null;
    } else {
      // console.log("First------");
      const res = await Notifications.getExpoPushTokenAsync();
      // console.log("Res------", res);
      pushToken = res.data;
    }
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(`https://rn-complete-guide-8bf39.firebaseio.com/products.json?auth=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        ownerPushToken: pushToken
      })
    });

    const resData = await response.json();

    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name,
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        pushToken: pushToken
      }
    });
  }
};

export const updateProduct = (id, title, description, imageUrl) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const response = await fetch(`https://rn-complete-guide-8bf39.firebaseio.com/products/${id}.json?auth=${token}`, {
      method: 'PATCH',   // method patch is just like the put method but it only updates the respective product
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl
      })
    });

    if (!response.ok) {
      throw new Error('Something went wrong!');
    };

    const res = await response.json();
    // console.log("res---------------", res);

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      }
    });
  };
};