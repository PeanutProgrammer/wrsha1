import React from "react";
import '../style/OfficerCard.css';  // Update path if necessary
import { Link } from "react-router-dom";

const OfficerCard = ({ id, mil_id, name, join_date, rank, end_date }) => {
  // Function to determine the right route based on rank
  const getDetailsLink = () => {
    if (rank === "عريف" || rank === "رقيب" || rank === "رقيب أول" || rank === "مساعد" || rank === "مساعد أول" || rank === "صانع ماهر" || rank === "صانع دقيق" || rank === "ملاحظ" || rank === "ملاحظ فني") {
      // This is an NCO, so link to the NCO details page
      return `/dashboard/PastWorkersHome/PastNCOs/details/${id}`;
    } else {
      // This is an officer, so link to the officer details page
      return `/dashboard/PastWorkersHome/PastOfficers/details/${id}`;
    }
  };

  return (
    <div className="officer-card">
      <div className="card bg-dark text-light">
        <div className="card-body">
          <h3 className="card-title">{name}</h3>
          <p className="card-text">
            <strong>الرقم العسكري:</strong> {mil_id} <br />
            <strong>الرتبة:</strong> {rank} <br />
            <strong>تاريخ الضم:</strong> {new Date(join_date).toLocaleDateString()} <br />
            <strong>تاريخ الانتهاء:</strong> {new Date(end_date).toLocaleDateString()}
          </p>
          <Link className="btn btn-primary w-100" to={getDetailsLink()}>
            تفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficerCard;
