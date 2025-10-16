import "./ManageProducts.css";
import React, { useContext, useState, useMemo } from "react";
import { ShopContext } from "../../../Context/ShopContext";
import { FiPlusCircle } from "react-icons/fi";

import AdminItem from "../../Components/Card/AdminItem/AdminItem";
import ProductForm from "../../Components/ProductForm/ProductForm";

function ManageProducts() {
  const { all_product, products, productPagination, productIsLoading, productHandlePageChange } =
    useContext(ShopContext);

  // State to control visibility of  ProductForm
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Function to toggle the form visibility
  const toggleForm = () => {
    setIsFormVisible((prev) => !prev);
  };

  return (
    <div className="ManageProducts-container">
      <h1 id="ManageProducts-header">Quản lí sản phẩm</h1>

      {/* List of Products  */}
      {/* <div className="admin-products-list">
        <div className="index">
        <p>Product ID</p>
        <p>Image</p>
        <p>Category</p>
        <p>New price</p>
        <p>Old price</p>
        <p>Actions</p>
        </div>
        <div>
        {all_product.map((item, i) => (
          <AdminItem key={i} {...item} />
          ))}
          </div>
          </div> */}

      <div className="admin-products-list">
        <div id="filter">
          <div className="category">
            <h3>Category:</h3>
            <select>
              <option value="" disabled>
                Filter by Category
              </option>
              <option value="All">All</option>
              <option value="Meats">Meats</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="search">
            <h3>Search by product name:</h3>
            <input type="text" placeholder="Enter product name"></input>
          </div>
          <div className="search">
            <h3>Search by product ID:</h3>
            <input type="text" placeholder="Enter product ID"></input>
          </div>

          <div className="sort">
            <h3>Sort by price:</h3>
            <select>
              <option value="" disabled>
                Sort by price
              </option>
              <option value="Default">Default</option>
              <option value="Ascending">Ascending</option>
              <option value="Descending">Descending</option>
            </select>
          </div>
        </div>

        {/* 2. Use the pagination metadata */}
        <div>
          <button
            onClick={() => productHandlePageChange(productPagination.page - 1)}
            disabled={productPagination.page <= 1}
          >
            Previous
          </button>

          <span>
            Page {productPagination.page} of {productPagination.totalPages}
          </span>

          <button
            onClick={() => productHandlePageChange(productPagination.page + 1)}
            disabled={productPagination.page >= productPagination.totalPages}
          >
            Next
          </button>
        </div>


        <header>Danh sách các sản phẩm</header>
        <table id="table">
          <thead>
            <tr>
              <th className="index"></th>
              <th>Product ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>New price</th>
              <th>Old price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, i) => (
              <tr key={i}>
                {/* The Index Bar Cell */}
                <td className="index-bar-cell">
                  <div className="index-bar"></div>
                </td>

                {/* The rest of the product data will now be rendered by the AdminItem component */}
                <AdminItem
                  key={i}
                  {...item}
                  onEdit={toggleForm}
                  onDelete={toggleForm}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button id="add-product" onClick={toggleForm}>
        <FiPlusCircle />
        Add product
      </button>

      {/* Conditional Rendering of ProductForm */}
      {isFormVisible && (
        <div id="ProductForm-overlay">
          <ProductForm
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
          />
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
