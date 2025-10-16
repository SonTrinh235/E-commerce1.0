import { useState } from "react";
import "./ProductForm.css";

function ProductForm({ onCancel }) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  return (
    <div className="ProductForm-container">
      <button id="ProductForm-cancel" onClick={onCancel}>
        Cancel
      </button>
      <div>Product Form</div>
      <form>
        <div>productId:</div>
        <input type="text" value={productId}/>
        <div>productName:</div>
        <input type="text" value={productName}/>
        <div>productImage:</div>
        <input type="text" value={productImage}/>
        <div>productCategory:</div>
        <input type="text" value={productCategory}/>
        <div>productPrice:</div>
        <input type="text" value={productPrice}/>
        <div>productOldPrice:</div>
        <input type="text" value={productOldPrice}/>
      </form>
      <button id="ProductForm-submit" onClick={onCancel}>
        Submit
      </button>
    </div>
  );
}

export default ProductForm;
