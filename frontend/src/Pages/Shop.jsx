import React from "react";
import Popular from "../Components/Popular/Popular";
import Offers from "../Components/Offers/Offers";
import NewsLetter from "../Components/NewsLetter/NewsLetter";
import NewArrivals from "../Components/NewArrivals/NewArrivals";

const Shop = () => {
    return (
        <div>
            {/* <Hero/> */}
            <Popular/>
            {/* <Offers/> */}
            <NewArrivals/>
            <NewsLetter/>
        </div>
    );
}

export default Shop;