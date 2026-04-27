import { BrowserRouter, Routes, Route } from "react-router-dom";
import Showcase from "./components/Showcase";
import Admin from "./components/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Showcase />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
