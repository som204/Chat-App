import AppRoutes from "./Routes/AppRoutes";
import { UserProvider } from "./Context/user.context";

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}

export default App;
