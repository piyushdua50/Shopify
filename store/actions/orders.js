import Order from "../../models/order";

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const response = await fetch(`https://rn-complete-guide-8bf39.firebaseio.com/orders/${userId}.json`, {
        method: 'GET'  // optional for GET Request
      });

      if (!response.ok) {
        throw new Error('Something went wrong!');
      };

      const resData = await response.json();

      const loadedOrders = [];
      for (const key in resData) {
        loadedOrders.push(
          new Order(
            key,
            resData[key].cartItems,
            resData[key].totalAmount,
            new Date(resData[key].date)
          )
        )
      };

      dispatch({ type: SET_ORDERS, orders: loadedOrders });
    } catch (err) {
      throw err;
    };
  }
};

export const addOrder = (cartItems, totalAmount) => {
  const date = new Date();
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(`https://rn-complete-guide-8bf39.firebaseio.com/orders/${userId}.json?auth=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cartItems,
        totalAmount,
        date: date.toISOString()
      })
    });

    if (!response.ok) {
      throw new Error("An Error occured");
    }

    const resData = await response.json();
    // console.log("+++++++++", resData);

    // Storing it to the Redux store by dispatching
    dispatch({
      type: ADD_ORDER,
      orderData: { id: resData.name, items: cartItems, amount: totalAmount, date: date }
    })

    // Sending the push notification for every order
    for (const cartItem of cartItems) {
      const pushToken = cartItem.productPushToken;
      // console.log("Push Token", cartItem);
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: pushToken,
          title: 'Order was Placed!',
          body: cartItem.productTitle
        })
      })
    }
  };
};
