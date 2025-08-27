import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
  route: [],
  customerid: null,
  location: null,
  cart: [],
  activeChat: '',
  wishlist: [],
  onlineUsers: [],   // Will be updated via WebSocket messages
  messages: []       // Will be updated via WebSocket messages
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

    // WebSocket related reducers
    setOnlineUsers: (state, action) => {
      // Filter out the current user from online users list
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
      state.activeChat = action.payload  // which user we are chatting with
    },
    
    // Add a new reducer to handle user status updates
    updateUserStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      const userIndex = state.onlineUsers.findIndex(user => user.uid === userId);
      
      if (isOnline && userIndex === -1) {
        // Add user to online list
        state.onlineUsers.push({ uid: userId, isOnline: true });
      } else if (!isOnline && userIndex !== -1) {
        // Remove user from online list
        state.onlineUsers.splice(userIndex, 1);
      }
    },
    
    // Clear all messages (optional)
    clearMessages: (state) => {
      state.messages = [];
    }
  },
})

// Extract actions
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

// Note: All WebSocket communication is now handled by the useWebSocket hook
// in your components, which will dispatch these actions when messages are received