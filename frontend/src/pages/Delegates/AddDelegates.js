import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import "../../style/style.css";
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";

// Validation schema using yup
const schema = yup.object().shape({
    rank: yup.string().required('الرتبة مطلوبة'),
  name: yup.string().min(3, 'اسم المندوب يجب أن يكون أكثر من 3 حروف').max(30, 'اسم المندوب يجب ألا يتجاوز 30 حرف').required('اسم المندوب مطلوب'),
  notes: yup.string().required('سبب الزيارة مطلوب'),
  unit: yup.string().required('اسم الوحدة مطلوب'),
});

const AddDelegates = () => {
  const auth = getAuthUser();
  const [delegate, setDelegate] = useState({
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
const createdelegate = async (data) => {
    setDelegate((prevState) => ({ ...prevState, loading: true }));

    const formattedData = {
        ...data,
        visit_start: formatDateToLocalString(new Date()),  // Automatically set to current date and time
        visit_end: null,  // If visit_end is not provided, send null
    };

    console.log("Request Data with visit_end:", formattedData);

    try {
        await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/delegate/`, formattedData, {
            headers: {
                token: auth.token,
            },
        });

        setDelegate({
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

        setDelegate({
            ...delegate,
            loading: false,
            err: errorMessage,
            success: null,
        });
    }
};



  
  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة مندوب جديد</h1>

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
          <Form.Control
            as="select"
            {...register("rank")}
            className={`form-control ${errors.rank ? "is-invalid" : ""}`}
          >
            <option value="">إختر رتبة / درجة المندوب</option>
            <option value="جندي">جندي</option>
            <option value="عريف مجند">عريف مجند</option>
            <option value="عريف">عريف</option>
            <option value="رقيب">رقيب</option>
            <option value="رقيب أول">رقيب أول</option>
            <option value="مساعد">مساعد</option>
            <option value="مساعد أول">مساعد أول</option>
            <option value="صانع ماهر">صانع ماهر</option>
            <option value="صانع دقيق">صانع دقيق</option>
            <option value="ملاحظ">ملاحظ</option>
            <option value="ملاحظ فني">ملاحظ فني</option>
            <option value="ملازم">ملازم</option>
            <option value="ملازم أول">ملازم أول</option>
            <option value="نقيب">نقيب</option>
            <option value="نقيب أ ح">نقيب أ ح</option>
            <option value="رائد">رائد</option>
            <option value="رائد أ ح">رائد أ ح</option>
            <option value="مقدم">مقدم</option>
            <option value="مقدم أ ح">مقدم أ ح</option>
            <option value="عقيد">عقيد</option>
            <option value="عقيد أ ح">عقيد أ ح</option>
            <option value="عميد">عميد</option>
            <option value="عميد أ ح">عميد أ ح</option>
            <option value="لواء">لواء</option>
            <option value="لواء أ ح">لواء أ ح</option>
            <option value="فريق">فريق</option>
            <option value="فريق أول">فريق أول</option>
            <option value="مشير">مشير</option>
          </Form.Control>
          {errors.rank && (
            <div className="invalid-feedback">{errors.rank.message}</div>
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
          disabled={delegate.loading}
        >
          {delegate.loading ? "جاري الإضافة..." : " إضافة"}
        </Button>
      </Form>
    </div>
  );
};

export default AddDelegates;
