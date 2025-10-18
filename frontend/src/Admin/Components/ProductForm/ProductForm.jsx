import { useEffect, useState } from "react";
import "./ProductForm.css";
import DefaultImage from "../../../assets/placeholder-image.png";
import { FiX, FiUpload } from "react-icons/fi";

function ProductForm({ mode, currentItem = null, onCancel }) {
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    productImage: "",
    productCategory: [],
    productPrice: "",
    productOldPrice: "",
  });

  const handleChange = (e) => {
    if (mode === 'delete') {
      return;
    }

    const { name, value, type, files } = e.target;

    let newValue = value;

    if (type === "file") {
      newValue = files[0];
    }

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  // UseEffect for init form
  useEffect(() => {
    if (currentItem) {
      setFormData({
        productId: currentItem.id || "",
        productName: currentItem.name || "",
        productImage: currentItem.image || "",
        productCategory: currentItem.category || [],
        productPrice: currentItem.new_price || "",
        productOldPrice: currentItem.old_price || "",
      });
    } else {
      setFormData({
        productId: "",
        productName: "",
        productImage: "",
        productCategory: [],
        productPrice: "",
        productOldPrice: "",
      });
    }
  }, [currentItem]);

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
//  useEffect for image preview on upload
  useEffect(() => {
    // Check if formData.productImage is a File object (not null/undefined)
    if (formData.productImage instanceof File) {
      // Create a temporary URL for the browser to display the image
      const url = URL.createObjectURL(formData.productImage);
      setImagePreviewUrl(url);

      // Cleanup: Revoke the object URL when the component unmounts or state changes
      return () => URL.revokeObjectURL(url);
    }
    // Handle when product data (initialData) already has a URL string (e.g., in Edit mode)
    else if (
      typeof formData.productImage === "string" &&
      formData.productImage
    ) {
      setImagePreviewUrl(formData.productImage);
    } else {
      setImagePreviewUrl(null);
    }
  }, [formData.productImage]);

  let title = "Product Form";
  let subTitle = "Product Form";
  let submitText = "Submit";

  if (mode === "add") {
    title = "Add New Product";
    subTitle = "Enter data for new product:";
    submitText = "Create";
  } else if (mode === "edit") {
    title = "Editing Product";
    subTitle = "Product data will be updated to new data";
    submitText = "Confirm Edit";
  } else if (mode === "delete") {
    title = "Confirm: Deleting Item";
    subTitle = "Selected Item will be deleted, please confirm";
    submitText = "Delete Item";
  }

  return (
    <div className="ProductForm-container">
      <header>
        <div id="title">{title}</div>
        <div id="subTitle">{subTitle}</div>
      </header>
      <form className="product-form">
        <div id="section-image">
          <div>productImage:</div>
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} />
          ) : (
            <img src={formData.productImage || DefaultImage} />
          )}
          {mode !== "delete" && (
            <input
              type="file"
              id="upload-image"
              name="productImage"
              onChange={handleChange}
            />
          )}
        </div>
        <div id="section-data">
          <div>productId:</div>
          <input
            name="productId"
            type="text"
            placeholder="Enter productId"
            value={formData.productId}
            onChange={handleChange}
            />
          <div>productName:</div>
          <input
            name="productName"
            type="text"
            placeholder="Enter productName"
            value={formData.productName}
            onChange={handleChange}
            />
          <div>productCategory:</div>
          <input
            name="productCategory"
            type="text"
            placeholder="Enter productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            />
          <div>productPrice:</div>
          <input
            name="productPrice"
            type="number"
            placeholder="Enter productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            />
          <div>productOldPrice:</div>
          <input
            name="productOldPrice"
            type="number"
            placeholder="Enter productOldPrice"
            value={formData.productOldPrice}
            onChange={handleChange}
          />
        </div>
      </form>
      <button id="ProductForm-submit" onClick={onCancel}>
        {submitText}
      </button>
      <button id="ProductForm-cancel" onClick={onCancel}>
        <FiX />
        Cancel
      </button>
    </div>
  );
}

export default ProductForm;
