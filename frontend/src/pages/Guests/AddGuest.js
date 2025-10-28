import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Guest.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string().min(3, 'اسم الزائر يجب أن يكون أكثر من 3 حروف').max(30, 'اسم الزائر يجب ألا يتجاوز 30 حرف').required('اسم الزائر مطلوب'),
  reason: yup.string().required('سبب الزيارة مطلوب'),
  visit_to: yup.number().required('المسؤول الذي تتم زيارته مطلوب'),
});
const AddGuests = () => {
  const auth = getAuthUser();
  const [officer, setOfficer] = useState([]);
  const [guest, setGuest] = useState({
    loading: false,
    err: [],
    success: null,
  });

   const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });


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
  const createGuest = async (data) => {
    setGuest({ ...guest, loading: true });

      console.log("Request Data:", data);

  // Format the dates (join_date and dob) to yyyy-MM-DD format
  const formattedData = {
    ...data,
    visit_start: formatDateToLocalString(new Date()),  // Automatically set to current date and time
  };

  // Log the formatted data
  console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post('http://localhost:4001/Guest/', formattedData, {
        headers: { token: auth.token },
      });

       setGuest({
        loading: false,
        err: [],
        success: 'تمت الإضافة بنجاح!',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setGuest({
        ...guest,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
        success: null,
      });
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/officer/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setOfficer(resp.data))
      .catch((err) => console.log(err));
  }, []);

   return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة زائر جديد</h1>

      {/* Display Errors */}
      {guest.err && (
        <Alert variant="danger" className="p-2">
          {guest.err}
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
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </Form.Group>
        
          <Form.Group controlId="visit_to" className="form-group">
            <Form.Label>المسؤول الذي تتم زيارته</Form.Label>
            <Form.Control
              as="select"
              {...register("visit_to")}
              className={`form-control ${errors.visit_to ? "is-invalid" : ""}`}
            >
              <option value="">اختر المسؤول</option>
              {officer.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.rank + " / " + officer.name}
                </option>
              ))}
            </Form.Control>
            {errors.visit_to && <div className="invalid-feedback">{errors.visit_to.message}</div>}
          </Form.Group>
        
          <Form.Group controlId="visit_reason" className="form-group">
            <Form.Label>سبب الزيارة</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل سبب الزيارة"
              {...register("visit_reason")}
              className={`form-control ${errors.visit_reason ? "is-invalid" : ""}`}
            />
            {errors.visit_reason && <div className="invalid-feedback">{errors.visit_reason.message}</div>}
          </Form.Group>



        {/* Submit Button */}
        <Button type="submit" variant="primary" className='submit-btn' disabled={guest.loading}>
          {guest.loading ? 'جاري الإضافة...' : 'إضافة الجندي'}
        </Button>
      </Form>
    </div>
  );
};

export default AddGuests;
