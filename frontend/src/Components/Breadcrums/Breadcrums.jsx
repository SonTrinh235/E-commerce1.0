import "./Breadcrums.css";
import arrow_icon from "../../assets/breadcrum_arrow.png";

const Breadcrums = ({ product }) => {
  // Nếu chưa có product (đang fetch), tránh đọc thuộc tính
  if (!product) {
    return (
      <div className="breadcrum">
        HOME <img src={arrow_icon} alt="" /> SHOP{" "}
        <img src={arrow_icon} alt="" /> ...
      </div>
    );
  }

  const category = product?.category ?? "-";
  const name = product?.name ?? "-";

  return (
    <div className="breadcrum">
      HOME <img src={arrow_icon} alt="" /> SHOP{" "}
      <img src={arrow_icon} alt="" /> {category}{" "}
      <img src={arrow_icon} alt="" /> {name}
    </div>
  );
};

export default Breadcrums;
