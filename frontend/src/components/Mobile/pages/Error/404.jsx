import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import fnf from '../../../assets/404.gif';

const NotFound = () => {
  return (
    <div className="container text-center d-flex flex-column justify-content-center align-items-center vh-100">
      <img src={fnf} alt="Not Found" className="img-fluid my-4" />
    </div>
  );
};

export default NotFound;
