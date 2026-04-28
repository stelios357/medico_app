import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Calculator from './pages/Calculator.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/calc" element={<Calculator />} />
      </Routes>
    </BrowserRouter>
  );
}
