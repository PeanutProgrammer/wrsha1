import React, { useState, useEffect } from "react";
import "./style/Productlist.css";
import ProductCard from "../Officers/components/OfficerCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const ProductList = () => {
  const auth = getAuthUser();

  const [products, setproducts] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });
  const [search, setSearch] = useState("");
  const [priceStart, setPriceStart] = useState("");
  const [priceEnd, setPriceEnd] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [searchResultsFound, setSearchResultsFound] = useState(false);

  useEffect(() => {
    setproducts({ ...products, loading: true });
    axios
      .get("http://localhost:4001/Appointments/filter/", {
        headers: {
          token: auth.token,
        },
        params: {
          search: search,
          priceStart: priceStart,
          priceEnd: priceEnd,
          source: source,
          destination: destination,
        },
      })
      .then((resp) => {
        setproducts({
          ...products,
          results: resp.data,
          loading: false,
          err: null,
        });
        setSearchResultsFound(resp.data.length > 0);
      })
      .catch((err) => {
        setproducts({ ...products, loading: false, err: err.response.data.msg });
      });

      console.log(products.err);
  }, [products.reload]);

  const searchPro = (e) => {
    e.preventDefault();
    setproducts({ ...products, reload: products.reload + 1 });
  };

  return (
    <>
      <div className="home-container">
        {products.loading === true && (
          <div className="spino">
            <div className="spinner-border " role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {products.loading === false && products.err == null && (
          <>
            <form onSubmit={searchPro}>
              <input
                type="text"
                placeholder=" Search for appointments"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-dark">Search</button>
                      </form>
                      
                      {products.err && (
   <div className="alert alert-warning" role="alert">
      {products.err}
   </div>
)}


            <div className="d-flex">
              <div className="row g-3 align-items-center mx-5 mt-1">
                <div className="col-auto">
                  <label htmlFor="inputPriceStart" className="col-form-label">
                    Start Price
                  </label>
                </div>
                <div className="col-auto">
                  <input
                    type="text"
                    id="inputPriceStart"
                    className="form-control bg-dark text-info" value={priceStart} onChange={(e) => setPriceStart(e.target.value)} aria-labelledby="passwordHelpInline"/>
                                </div>
                            </div>
                            <div className="row g-3 align-items-center mx-5 mt-1">
                                <div className="col-auto">
                                    <label htmlFor="inputPriceEnd" className="col-form-label">End Price</label>
                                </div>
                                <div className="col-auto">
                                    <input type="text" id="inputPriceEnd" className="form-control bg-dark text-info" value={priceEnd} onChange={(e) => setPriceEnd(e.target.value)}
                                    aria-labelledby="passwordHelpInline"/>

                        </div>
                            </div>
                            <div className="row g-3 align-items-center mx-5 mt-1">
                        <div className="col-auto">
                        <label for="inputPassword6" className="col-form-label">Source</label>
                        </div>
                        <div className="col-auto">
                        <input type="text" id="inputPriceEnd" className="form-control bg-dark text-info" value={source} onChange={(e) => setSource(e.target.value)}
                                    aria-labelledby="passwordHelpInline"/>
                        </div>
                    </div>
                    <div className="row g-3 align-items-center mx-5 mt-1">
                        <div className="col-auto">
                        <label for="inputPassword6" className="col-form-label">Destination</label>
                        </div>
                        <div className="col-auto">
                        <input type="text" id="inputPriceEnd" className="form-control bg-dark text-info" value={destination} onChange={(e) => setDestination(e.target.value)}
                                    aria-labelledby="passwordHelpInline"/>                        </div>
                    </div>
                    
                    {/* <div className="mt-4">
                        <label for="myRange" class="form-label"> Price{value}$ </label>
                        <input type="range" min="0" max="4000" value={value} onChange={handlerangedinput} id="myRange"/>
                            </div> */}
                            </div>
                        <div className="product-list-container">
                            <div className="product-list row row-cols-md-2">
                                {products.results.map((item)=>(
                                    <div className="col mb-4" key={item.id}>
                                        <ProductCard id={item.id } code={item.code} source={item.source} destination={item.destination} start_datetime={item.start_datetime} end_datetime={item.end_datetime} bus={item.bus} price={item.price} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {products.loading === false && products.err !=null &&(
                    <div className="alert alert-warning" role="alert">
                        "Something went wrong, please try again: "{products.err}
                    </div>
                )}
            </div>
        </>
    );
};
export default ProductList;
