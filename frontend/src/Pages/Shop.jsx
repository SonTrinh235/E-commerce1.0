import React from "react";
import Popular from "../Components/Popular/Popular";
import NewsLetter from "../Components/NewsLetter/NewsLetter";
import NewArrivals from "../Components/NewArrivals/NewArrivals";
import ShopCategory from "./ShopCategory";
import all_banner from "../assets/banner_all.png";

const Shop = () => {
  return (
    <div className="shop-page">
      <Popular />
      <ShopCategory category={null} banner = {all_banner} />
      <NewArrivals />
      <NewsLetter />
    </div>
  );
};

export default Shop;
