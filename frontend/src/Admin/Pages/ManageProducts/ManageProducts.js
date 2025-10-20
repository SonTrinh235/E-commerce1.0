import "./ManageProducts.css";
import React, { useContext, useState, useMemo, useEffect, use } from "react";
import all_product from "../../../data/all_product";
import { FaPlusCircle } from "react-icons/fa";
import { getAllProducts } from "../../../api/productService";

import AdminItem from "../../Components/Card/AdminItem/AdminItem";
import ProductForm from "../../Components/ProductForm/ProductForm";

function ManageProducts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 20;

  // Fetch products method (from all product)
  const fetchProducts = async (page = 1, limit = 20) => {
    const response = await getAllProducts(page, limit);
    setProducts(response.data.list);
    setTotalProducts(response.data.total);
    setTotalPages(response.data.totalPages)
  };

  // Fetch new page upon page change
  useEffect(() => {
    fetchProducts(currentPage, limit);
  }, [currentPage]);


  // State of  ProductForm
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("");
  const [formCurrentItem, setFormCurrentItem] = useState(null);

  // Open form with mode "add", "edit", "delete"
  const openForm = (mode, currentItem = null) => {
    setFormMode(mode);
    setFormCurrentItem(currentItem);
    setIsFormVisible(true);
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

        {/* Paging for products */}
        <div>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of{" "}
            {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>

        <header>Danh sách các sản phẩm</header>
        <div>Hiển thị {totalProducts} sản phẩm</div>
        <table id="table">
          <thead>
            <tr>
              <th className="index">#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, i) => (
              <tr key={i}>
                {/* The Index Bar Cell */}
                <td className="index-bar-cell">
                  <div className="index-bar">{i+1+(currentPage-1)*limit}</div>
                </td>

                {/* The rest of the product data will now be rendered by the AdminItem component */}
                <AdminItem
                  key={i}
                  {...item}
                  onEdit={() => openForm("edit", item)}
                  onDelete={() => openForm("delete", item)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button id="add-product" onClick={() => openForm("add")}>
        <FaPlusCircle />
        Add product
      </button>

      {/* Conditional Rendering of ProductForm */}
      {isFormVisible && (
        <div id="ProductForm-overlay">
          <ProductForm
            mode={formMode}
            currentItem={formCurrentItem}
            onCancel={() => setIsFormVisible(false)} // Pass a function to close the form
            onSuccess = {() => fetchProducts(currentPage, limit)}
          />
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
