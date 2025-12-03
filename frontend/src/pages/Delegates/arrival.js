import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "./delegate.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "react-datetime/css/react-datetime.css";
import Select from 'react-select'; // Importing react-select


// Validation schema using yup
const schema = yup.object().shape({
  rank: yup.string().required("الرتبة مطلوبة"),
  name: yup
    .string()
    .min(3, "اسم المندوب يجب أن يكون أكثر من 3 حروف")
    .max(30, "اسم المندوب يجب ألا يتجاوز 30 حرف")
    .required("اسم المندوب مطلوب"),
  notes: yup.string().required("سبب الزيارة مطلوب"),
  unit: yup.string().required("اسم الوحدة مطلوب"),
});

const DelegateArrival = () => {
  const auth = getAuthUser();
  const [delegate, setDelegate] = useState({
    loading: false,
    err: null, // Initially null, update with actual error message
    success: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Function to format date in "YYYY-MM-DD HH:mm:ss"
  const formatDateToLocalString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(d.getDate()).padStart(2, "0"); // pad day with zero if needed
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Handle form submission
  // Handle API error response more gracefully
  const createdelegate = async (data) => {
    setDelegate((prevState) => ({ ...prevState, loading: true }));

    const formattedData = {
      ...data,
      visit_start: formatDateToLocalString(new Date()), // Automatically set to current date and time
      visit_end: null, // If visit_end is not provided, send null
    };

    console.log("Request Data with visit_end:", formattedData);

    try {
      await axios.post("http://192.168.1.3:4001/delegate/", formattedData, {
        headers: {
          token: auth.token,
        },
      });

      setDelegate({
        loading: false,
        err: null,
        success: "تم تسجيل الدخول بنجاح!",
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000);
    } catch (err) {
      // Handle errors gracefully and ensure it's a string before setting it
      const errorMessage = err.response
        ? Array.isArray(err.response.data.errors)
          ? err.response.data.errors.map((e) => e.msg).join(", ")
          : err.response.data.errors
        : "Something went wrong. Please try again later.";

      setDelegate({
        ...delegate,
        loading: false,
        err: errorMessage,
        success: null,
      });
    }
  };

  const rankOptions = [
    "جندي",
    "عريف مجند",
    "عريف",
    "رقيب",
    "رقيب أول",
    "مساعد",
    "مساعد أول",
    "صانع ماهر",
    "صانع دقيق",
    "ملاحظ",
    "ملاحظ فني",
    "ملازم",
    "ملازم أول",
    "نقيب",
    "نقيب أ ح",
    "رائد",
    "رائد أ ح",
    "مقدم",
    "مقدم أ ح",
    "عقيد",
    "عقيد أ ح",
    "عميد",
    "عميد أ ح",
    "لواء",
    "لواء أ ح",
    "فريق",
    "فريق أول",
    "مشير",
  ].map((rank) => ({ value: rank, label: rank }));


  const rankSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "0.375rem",
      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13,110,253,.25)" : null,
      minHeight: "38px",
      direction: "rtl", // Arabic friendly
    }),
    menu: (provided) => ({
      ...provided,
      direction: "rtl",
      textAlign: "right",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#f8f9fa" : "white",
      color: "black",
      cursor: "pointer",
      textAlign: "right",
    }),
    singleValue: (provided) => ({
      ...provided,
      textAlign: "right",
      direction: "rtl",
    }),
  };

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل دخول مندوب جديد</h1>

      {/* Display Errors */}
      {delegate.err && (
        <Alert variant="danger" className="p-2">
          {Array.isArray(delegate.err)
            ? delegate.err.map((error, index) => <div key={index}>{error}</div>)
            : delegate.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {delegate.success && (
        <Alert variant="success" className="p-2">
          {delegate.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createdelegate)} className="form">
        <Form.Group controlId="rank" className="form-group">
          <Form.Label>الرتبة / الدرجة</Form.Label>

          <Select
            options={rankOptions}
            placeholder="إختر رتبة / درجة المندوب"
            isSearchable
            styles={rankSelectStyles}
            classNamePrefix="react-select"
            onChange={(selected) => setValue("rank", selected.value)}
          />

          {errors.rank && (
            <div className="invalid-feedback d-block">
              {errors.rank.message}
            </div>
          )}
        </Form.Group>
        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم المندوب</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المندوب"
            {...register("name")}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </Form.Group>
        <Form.Group controlId="unit" className="form-group">
          <Form.Label>اسم الوحدة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الوحدة"
            {...register("unit")}
            className={`form-control ${errors.unit ? "is-invalid" : ""}`}
          />
          {errors.unit && (
            <div className="invalid-feedback">{errors.unit.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="notes" className="form-group">
          <Form.Label>سبب الزيارة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل سبب الزيارة"
            {...register("notes")}
            className={`form-control ${errors.notes ? "is-invalid" : ""}`}
          />
          {errors.notes && (
            <div className="invalid-feedback">{errors.notes.message}</div>
          )}
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="submit-btn"
          disabled={delegate.loading}
        >
          {delegate.loading ? "جاري تسجيل الدخول..." : " تسجيل دخول"}
        </Button>
      </Form>
    </div>
  );
};

export default DelegateArrival;
