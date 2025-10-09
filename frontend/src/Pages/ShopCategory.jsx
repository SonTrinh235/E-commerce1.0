import React, { useContext, useState, useMemo } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";

const ShopCategory = (props) => {
  const { all_product = [] } = useContext(ShopContext) || {};
  const [sortOption, setSortOption] = useState("default");

  const filteredProducts = useMemo(() => {
    return all_product.filter((item) =>
      item.category.includes(props.category)
    );
  }, [all_product, props.category]);

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    if (sortOption === "price-asc") {
      sorted.sort((a, b) => a.new_price - b.new_price);
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => b.new_price - a.new_price);
    }
    return sorted;
  }, [filteredProducts, sortOption]);

  return (
    <div className="shopcategory">
      <div className="shopcategory-banner">
        <img src={props.banner} alt="" />
      </div>

      <div className="shopcategory-indexSort">
        <div className="shopcategory-index">
          <p>
            <b>Showing {sortedProducts.length}</b> results
          </p>
        </div>
        <div className="shopcategory-sort">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            >
            <option value="default">Sort</option>
            <option value="price-asc">Increase</option>
            <option value="price-desc">Decrease</option>
          </select>
        </div>
      </div>
        {/* <div className="sidebar">optional sidebar</div> */}
      <div className="shopcategory-products">
        {sortedProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
      <div className="shopcategory-loadmore">Load more</div>

    </div>
  );
};

export default ShopCategory;
