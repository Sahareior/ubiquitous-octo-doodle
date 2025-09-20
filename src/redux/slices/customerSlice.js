import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
  route: [],
  customerid: null,
  location: null,
  cart: [],
  activeChat: '',
  wishlist: [],
  onlineUsers: [],  
  messages: []       
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

    addToRoute: (state, action) => {
      state.route.push(action.payload)
    },
    
    selectedLocation: (state, action) => {
      state.location = action.payload
    },

    addCustomerId: (state, action) => {
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


    setOnlineUsers: (state, action) => {

      if (customerData && customerData.user) {
        state.onlineUsers = action.payload.filter(item => item.uid !== customerData.user.id);
      } else {
        state.onlineUsers = action.payload;
      }
    },
    
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    
    setActiveChat: (state, action) => {
      state.activeChat = action.payload  
    },
    

    updateUserStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      const userIndex = state.onlineUsers.findIndex(user => user.uid === userId);
      
      if (isOnline && userIndex === -1) {
       
        state.onlineUsers.push({ uid: userId, isOnline: true });
      } else if (!isOnline && userIndex !== -1) {
   
        state.onlineUsers.splice(userIndex, 1);
      }
    },
    

    clearMessages: (state) => {
      state.messages = [];
    }
  },
})

export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  addToRoute, 
  selectedLocation, 
  addCustomerId, 
  addToCart, 
  addToWishList, 
  setActiveChat,
  setOnlineUsers, 
  addMessage,
  updateUserStatus,
  clearMessages
} = customerSlice.actions

export default customerSlice.reducer
