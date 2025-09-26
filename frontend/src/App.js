import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import SearchResults from './Pages/SearchResults';
import ExclusiveOffers from "./Pages/ExclusiveOffers";

import meat_banner from './Components/Assets/banner_meats.png';
import veg_banner from './Components/Assets/banner_vegs.png';
import others_banner from './Components/Assets/banner_others.png';
import all_banner from './Components/Assets/banner_all.png';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route
            path="/meats"
            element={<ShopCategory banner={meat_banner} category="Meats" />}
          />
          <Route
            path="/vegs"
            element={<ShopCategory banner={veg_banner} category="Vegetables" />}
          />
          <Route
            path="/others"
            element={<ShopCategory banner={others_banner} category="Others" />}
          />
          <Route
            path="/all-products"
            element={<ShopCategory banner={all_banner} category="Products" />}
          />

          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/exclusive-offers" element={<ExclusiveOffers />} />
          <Route path='/search' element={<SearchResults />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
