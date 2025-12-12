import React from "react";
import '../../../style/card.css';
import { Link } from "react-router-dom";

const SoldierCard = ({ id, mil_id, name, department, join_date, end_date, rank }) => {
  return (
    <div className="officer-card">
      <div className="card bg-dark text-light">
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
          <p className="card-text">
            <strong>الرقم العسكري:</strong> {mil_id} <br />
            <strong>الدرجة:</strong> {rank} <br />
            <strong>الورشة / الفرع:</strong> {department} <br />
            <strong>تاريخ الضم:</strong> {new Date(join_date).toLocaleDateString()}
            <strong>تاريخ التسريح:</strong> {new Date(end_date).toLocaleDateString()}
          </p>
          <Link className="btn btn-primary w-100" to={`/dashboard/soldiers/details/${id}`}>
            تفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SoldierCard;
