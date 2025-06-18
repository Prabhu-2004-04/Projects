import { Routes, Route } from "react-router-dom";
import Index from "./index";
import Login from "./login";
import Register from "./register";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;