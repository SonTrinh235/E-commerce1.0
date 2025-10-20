import { useEffect, useState } from "react";
import "./ProductForm.css";
import DefaultImage from "../../../assets/placeholder-image.png";
import { FiX, FiUpload } from "react-icons/fi";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImageInfo,
} from "../../../api/productService";
import { uploadFile } from "../../../api/fileService";

function ProductForm({ mode, currentItem = null, onCancel, onSuccess }) {
  // Properties of form
  const [formData, setFormData] = useState({
    productImage: null,
    productName: "",
    productCategory: "",
    productPrice: "",
    productDescription: "",
    productStock: "",
  });

  // UseEffect for initial data of form (currentItem or blank)
  useEffect(() => {
    if (currentItem) {
      setFormData({
        productImage: null,
        productName: currentItem.name || "",
        productCategory: currentItem.category || "",
        productPrice: currentItem.price || "",
        productDescription: currentItem.description || "",
        productStock: currentItem.stock || "",
      });
    } else {
      setFormData({
        productImage: null,
        productName: "",
        productCategory: "",
        productPrice: "",
        productDescription: "",
        productStock: "",
      });
    }
    console.log("currentItem: ", currentItem);
  }, [currentItem]);

  // Handle change for input fields
  const handleChange = (e) => {
    if (mode === "delete") {
      return;
    }

    const { name, value, type, files } = e.target;

    let newValue = value;

    if (type === "file") {
      newValue = files[0];
    }

    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  // Handle Submit based on form mode
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    try {
      let response;

      if (mode === "add") {
        // 1. ADD MODE: Call the API to create a new product
        console.log("Submitting new product...");
        const createProductResponse = await createProduct({
          name: formData.productName,
          price: formData.productPrice,
          description: formData.productDescription,
          category: formData.productCategory,
          stock: formData.productStock,
        });

        const createdProductId = createProductResponse.data._id;

        // Upload image and update image info
        if (formData.productImage) {
          const uploadData = new FormData();
          // Append image file
          uploadData.append("file", formData.productImage);

          // Append the text/string elements directly as key-value pairs
          uploadData.append("tempid", formData.productImage.name);
          uploadData.append("targetId", createdProductId);
          uploadData.append("bucket", "dath-product-image");
          uploadData.append("accessLevel", "public");
          const uploadFileResponse = await uploadFile(uploadData);

          const uploadedImageInfo = {
            imageInfo: {
              fileId: uploadFileResponse.data.fileId,
              url: uploadFileResponse.data.url,
              status: uploadFileResponse.data.status,
            },
          };

          updateProductImageInfo(createdProductId, uploadedImageInfo);
        }

        alert("Product created successfully!");
      } else if (mode === "edit") {
        // 2. EDIT MODE: Call the API to update the existing product
        // productId required
        const productId = currentItem._id;
        console.log(`Updating product ${productId}...`);
        updateProduct(productId, {
          name: formData.productName,
          price: formData.productPrice,
          description: formData.productDescription,
          category: formData.productCategory,
          stock: formData.productStock,
        });

        // Upload and update image info if there is
        if (formData.productImage) {
          const uploadData = new FormData();
          // Append image file
          uploadData.append("file", formData.productImage);

          // Append the text/string elements directly as key-value pairs
          uploadData.append("tempid", formData.productImage.name);
          uploadData.append("targetId", productId);
          uploadData.append("bucket", "dath-product-image");
          uploadData.append("accessLevel", "public");
          const uploadFileResponse = await uploadFile(uploadData);

          const uploadedImageInfo = {
            imageInfo: {
              fileId: uploadFileResponse.data.fileId,
              url: uploadFileResponse.data.url,
              status: uploadFileResponse.data.status,
            },
          };

          updateProductImageInfo(productId, uploadedImageInfo);
        }

        alert("Product updated successfully!");
      } else if (mode === "delete") {
        // 3. DELETE MODE: Call the API to delete the existing product
        //  productId required
        const productId = currentItem._id;
        console.log(`Deleting product ${productId}...`);
        deleteProduct(productId);
        alert("Product Deleted successfully!");
      }

      onSuccess();
      onCancel();

      // Optional: Redirect user, close modal, or clear form here
    } catch (error) {
      // console.error("Submission failed:", error);
      // alert("Error saving product. Check the console for details.");
    }
  };

  //  useEffect for image preview on upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
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

  // Set text based on form mode
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

  const buttonClass =
    mode === "delete" ? "btn-delete" : mode === "edit" ? "btn-edit" : "btn-add";

  // Form container
  return (
    <div className="ProductForm-container">
      <header>
        <div id="title">{title}</div>
        <div id="subTitle">{subTitle}</div>
      </header>
      {/* Actual form */}
      <form className="product-form" onSubmit={handleSubmit}>
        {/* Image */}
        <div id="section-image">
          <div>Product Image</div>
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} />
          ) : (
            <img src={currentItem?.imageInfo?.url || DefaultImage} />
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
        {/* Data  */}
        <div id="section-data">
          <div>Product Name:</div>
          <input
            name="productName"
            type="text"
            placeholder="Enter productName"
            value={formData.productName}
            onChange={handleChange}
          />
          <div>Product Category:</div>
          <input
            name="productCategory"
            type="text"
            placeholder="Enter productCategory"
            value={formData.productCategory}
            onChange={handleChange}
          />
          <div>Product Price:</div>
          <input
            name="productPrice"
            type="number"
            placeholder="Enter productPrice"
            value={formData.productPrice}
            onChange={handleChange}
          />
          <div>Product Description:</div>
          <input
            name="productDescription"
            type="text"
            placeholder="Enter productDescription"
            value={formData.productDescription}
            onChange={handleChange}
          />
          <div>Product Stock:</div>
          <input
            name="productStock"
            type="number"
            placeholder="Enter productStock"
            value={formData.productStock}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className={buttonClass}>
          {submitText}
        </button>
      </form>
      <button id="ProductForm-cancel" onClick={onCancel}>
        <FiX />
        Cancel
      </button>
    </div>
  );
}

export default ProductForm;
