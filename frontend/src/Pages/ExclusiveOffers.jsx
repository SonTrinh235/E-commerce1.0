import React, { useContext, useState, useMemo } from "react";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";
import "./CSS/ExclusiveOffers.css";
import exclusive_banner from '../Components/Assets/banner_exclusive.png';

const ExclusiveOffers = () => {
  const { all_product = [] } = useContext(ShopContext) || {};
  const [sortOption, setSortOption] = useState("default");

  const discountedProducts = useMemo(() => {
    return all_product.filter(
      (product) => product.old_price && product.old_price > product.new_price
    );
  }, [all_product]);

  const sortedProducts = useMemo(() => {
    let sorted = [...discountedProducts];
    if (sortOption === "price-asc") {
      sorted.sort((a, b) => a.new_price - b.new_price);
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => b.new_price - a.new_price);
    }
    return sorted;
  }, [discountedProducts, sortOption]);

  return (
    <div className="exclusiveoffers">
        <img className ="exclusiveoffers-banner" src={exclusive_banner} alt="" />
      <div className="exclusiveoffers-indexSort">
        <p>
          <span>{sortedProducts.length}</span> Items found
        </p>
        <select
          className="exclusiveoffers-sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort</option>
          <option value="price-asc">Increase</option>
          <option value="price-desc">Decrease</option>
        </select>
      </div>

      <div className="exclusiveoffers-products">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p style={{ margin: "20px 170px" }}>No discounted products found.</p>
        )}
      </div>

      <div className="exclusiveoffers-loadmore">Explore More</div>
    </div>
  );
};

export default ExclusiveOffers;
