import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import "../../style/style.css";
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";
import Select from 'react-select'; // Importing react-select

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string().min(3, 'اسم الزائر يجب أن يكون أكثر من 3 حروف').max(30, 'اسم الزائر يجب ألا يتجاوز 30 حرف').required('اسم الزائر مطلوب'),
  reason: yup.string().optional('سبب الزيارة اختياري'),
  visit_to: yup.number().required('المسؤول الذي تتم زيارته مطلوب'),
});

const GuestArrival = () => {
  const auth = getAuthUser();
  const [officer, setOfficer] = useState([]);
  const [guest, setGuest] = useState({
    loading: false,
    err: null,  // Initially null, update with actual error message
    success: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Function to format date in "YYYY-MM-DD HH:mm:ss"
  const formatDateToLocalString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');  // months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');  // pad day with zero if needed
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Handle form submission
// Handle API error response more gracefully
const createGuest = async (data) => {
    setGuest((prevState) => ({ ...prevState, loading: true }));

    const formattedData = {
        ...data,
        visit_start: formatDateToLocalString(new Date()),  // Automatically set to current date and time
        visit_end: null,  // If visit_end is not provided, send null
    };

    console.log("Request Data with visit_end:", formattedData);

    try {
        await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/guest/`, formattedData, {
            headers: {
                token: auth.token,
            },
        });

        setGuest({
            loading: false,
            err: null,
            success: 'تمت الإضافة بنجاح!',
        });

        reset(); // Reset form after successful submission

        setTimeout(() => {
            window.history.back();
        }, 1000);
    } catch (err) {
        // Handle errors gracefully and ensure it's a string before setting it
        const errorMessage = err.response 
            ? (Array.isArray(err.response.data.errors) 
                ? err.response.data.errors.map(e => e.msg).join(', ') 
                : err.response.data.errors) 
            : 'Something went wrong. Please try again later.';

        setGuest({
            ...guest,
            loading: false,
            err: errorMessage,
            success: null,
        });
    }
};



  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officer/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setOfficer(resp.data))
      .catch((err) => console.log(err));
  }, []);


    const officerOptions = officer.map((officer) => ({
      value: officer.id,
      label: `${officer.rank} / ${officer.name}`,
      leaveTypeID: officer.leaveTypeID, // attach latest leave type
    }));

    // Handle when an officer is selected
    const handleOfficerChange = (selectedOption) => {
      if (selectedOption) {
        setValue("officerID", selectedOption.value); // Set the officerID field in react-hook-form
      }
    };

    // Custom styles for react-select to prevent conflict with Bootstrap's form-control
    const customStyles = {
      control: (provided) => ({
        ...provided,
        width: "100%",
        padding: "0.375rem 0.75rem",
        borderRadius: "0.25rem",
        border: "1px solid #ced4da",
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 1050, // Make sure the dropdown appears above other elements
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? "#007bff"
          : state.isFocused
          ? "#f8f9fa"
          : null,
        color: state.isSelected ? "#fff" : "#495057",
        fontWeight: state.isSelected ? "600" : "500",
      }),
    };

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل دخول زائر</h1>

      {/* Display Errors */}
      {guest.err && (
        <Alert variant="danger" className="p-2">
          {Array.isArray(guest.err)
            ? guest.err.map((error, index) => <div key={index}>{error}</div>)
            : guest.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {guest.success && (
        <Alert variant="success" className="p-2">
          {guest.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createGuest)} className="form">
        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم الزائر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الزائر"
            {...register("name")}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="visit_to" className="form-group">
          <Form.Label>المسؤول الذي تتم زيارته</Form.Label>
          <Select
            {...register("officerID")}
            options={officerOptions}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value}
            onChange={handleOfficerChange}
            className="react-select"
            styles={customStyles}
            placeholder="اختر الضابط المرافق"
          />
          {errors.visit_to && (
            <div className="invalid-feedback">{errors.visit_to.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="reason" className="form-group">
          <Form.Label>سبب الزيارة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل سبب الزيارة"
            {...register("reason")}
            className={`form-control ${errors.reason ? "is-invalid" : ""}`}
          />
          {errors.reason && (
            <div className="invalid-feedback">{errors.reason.message}</div>
          )}
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="submit-btn"
          disabled={guest.loading}
        >
          {guest.loading ? "جاري تسجيل الدخول..." : " تسجيل دخول"}
        </Button>
      </Form>
    </div>
  );
};

export default GuestArrival;
