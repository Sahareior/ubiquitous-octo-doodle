import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';


function App() {


  // useEffect(() => {
  //   if (customerId) {
  //     // send full userData object (static for now)
  //     const userData = {
  //       uid: customerId.user.id,
  //       name: customerId.user.first_name,         // static name
  //       email: customerId.user.email, // static email
  //       role: customerId.user.role,          // example role
  //       avatar: "https://via.placeholder.com/50" // static image
  //     };

  //     dispatch(initSocket(userData));
  //   }
  // }, [customerId, dispatch]);

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
