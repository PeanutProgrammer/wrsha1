import React from "react";
import '../style/CivillianCard.css';
import { Link } from "react-router-dom";

const CivillianCard = ({ id, nationalID, name, department, join_date, address, dob, telephone_number }) => {
  return (
    <div className="officer-card">
      <div className="card bg-dark text-light">
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
          <p className="card-text">
            <strong>الرقم القومي :</strong> {nationalID} <br />
            <strong>الورشة / الفرع:</strong> {department} <br />
            <strong>تاريخ الضم:</strong> {new Date(join_date).toLocaleDateString()}
          </p>
          <Link className="btn btn-primary w-100" to={`/dashboard/civillians/details/${id}`}>
            تفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CivillianCard;
