import React from "react";
import '../style/ExpertCard.css';
import { Link } from "react-router-dom";

const ExpertCard = ({ id, nationalID, name, company_name, security_clearance_number }) => {
  return (
    <div className="officer-card">
      <div className="card bg-dark text-light">
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
          <p className="card-text">
            <strong>الرقم القومي :</strong> {nationalID} <br />
            <strong>اسم الشركة:</strong> {company_name} <br />
            <strong>رقم التصديق الأمني:</strong> {security_clearance_number} <br />
          </p>
          <Link className="btn btn-primary w-100" to={`/dashboard/experts/details/${nationalID}`}>
            تفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
