import { createSlice } from '@reduxjs/toolkit'
import socket from '../../components/utils/socket'


const initialState = {
  value: 0,
  route: [],
  customerid: null,
  location: null,
  cart: [],
  activeChat: '',
  wishlist: [],
  onlineUsers: [],   // 👈 new for socket.io
  messages: []       // 👈 chat/messages
}

    const customerData = JSON.parse(localStorage.getItem("customerId"));

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },

    addToRoute: (state,action) =>{
      state.route.push(action.payload)
    },
    
    selectedLocation : (state,action) =>{
      state.location = action.payload
    },

    addCustomerId: (state,action) => {
      state.customerid = action.payload
    },

    addToCart: (state, action) => {
      const itemExists = state.cart.find(item => item.id === action.payload.id);
      if (!itemExists) {
        state.cart.push(action.payload);
      }
    },

    addToWishList: (state, action) => {
      const itemExists = state.wishlist.find(item => item.id === action.payload.id);
      if (!itemExists) {
        state.wishlist.push(action.payload);
      }
    },

    // ---------------- SOCKET.IO REDUCERS ----------------
    setOnlineUsers: (state, action) => {
     state.onlineUsers = action.payload;

    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    setActiveChat: (state, action) => {
  state.activeChat = action.payload  // which user we are chatting with
}
  },
})

// Extract actions
export const { 
  increment, decrement, incrementByAmount, 
  addToRoute, selectedLocation, addCustomerId, 
  addToCart, addToWishList, setActiveChat,
  setOnlineUsers, addMessage 
} = customerSlice.actions

export default customerSlice.reducer

// ---------------- SOCKET.IO THUNKS ----------------
export const initSocket = (currentUser) => (dispatch) => {
  if (!currentUser) return;

  // 1. Add user when connected
  socket.emit("addUser", currentUser);

  // 2. Listen for online users
  socket.on("getUsers", (users) => {
    dispatch(setOnlineUsers(users));
  });

  // 3. Listen for incoming messages
  socket.on("getMessage", (data) => {
    dispatch(addMessage(data));
  });
};

// Send a message to another user
export const sendMessage = (message) => () => {
  socket.emit("sendMessage", message);
};
