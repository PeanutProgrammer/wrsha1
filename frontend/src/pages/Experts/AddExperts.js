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
  nationalID: yup.string().required('رقم تحقيق الشخصية مطلوب').optional().nullable(),
  name: yup.string().min(3, 'اسم الخبير يجب أن يكون أكثر من 3 حروف').max(40, 'اسم الخبير يجب ألا يتجاوز 40 حرف').required('اسم الخبير مطلوب'),
  security_clearance_number: yup.string().required('رقم التصديق الأمني مطلوب'),
  valid_from: yup.date().required('تاريخ بداية التصديق الأمني مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  valid_through: yup.date().required('تاريخ انتهاء التصديق الأمني مطلوب').min(yup.ref('valid_from'), 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية').typeError('يرجى إدخال تاريخ صحيح'),
  company_name: yup.string().required('اسم الشركة مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),

});

const AddExperts = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [expert, setExpert] = useState({
    loading: false,
    err: [],
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

      const formatDateToLocalString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');  // months are 0-indexed
  const day = String(d.getDate()).padStart(2, '0');  // pad day with zero if needed
  return `${year}-${month}-${day}`;
};

  // Handle form submission
  const createExpert = async (data) => {
    setExpert({ ...expert, loading: true });

    const formattedData = {
    ...data,
  valid_from: data.valid_from ? formatDateToLocalString(data.valid_from) : '',
  valid_through: data.valid_through ? formatDateToLocalString(data.valid_through) : '',
  };

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/expert/`, formattedData, {
        headers: {
          token: auth.token,
        },
      });

      setExpert({
        loading: false,
        err: [],
        success: 'تمت الإضافة بنجاح!',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000);
    } catch (err) {
      setExpert({
        loading: false,
        err: err.response ? err.response.data.errors : ['حدث خطأ ما. يرجى المحاولة لاحقًا.'],
        success: null,
      });
    }
  };


   useEffect(() => {
        axios
          .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/department/`, {
            headers: {
              token: auth.token,
            },
          })
          .then((resp) => setDept(resp.data))
          .catch((err) => console.log(err));
      }, []);

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة خبير جديد</h1>
      
      {/* Display Errors */}
      {expert.err.length > 0 && (
        <Alert variant="danger" className="p-2">
          <ul>
            {expert.err.map((error, index) => (
              <li key={index}>{error.msg || error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Display Success Message */}
      {expert.success && (
        <Alert variant="success" className="p-2">
          {expert.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(createExpert)} className="form">
        <Form.Group controlId="nationalID" className="form-group">
          <Form.Label>رقم تحقيق الشخصية</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم تحقيق الشخصية"
            {...register("nationalID")}
            className={`form-control ${errors.nationalID ? 'is-invalid' : ''}`}
          />
          {errors.nationalID && <div className="invalid-feedback">{errors.nationalID.message}</div>}
        </Form.Group>

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم الخبير</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الخبير"
            {...register("name")}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </Form.Group>

        <Form.Group controlId="security_clearance_number" className="form-group">
          <Form.Label>رقم التصديق الأمني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم التصديق الأمني"
            {...register("security_clearance_number")}
            className={`form-control ${errors.security_clearance_number ? 'is-invalid' : ''}`}
          />
          {errors.security_clearance_number && <div className="invalid-feedback">{errors.security_clearance_number.message}</div>}
        </Form.Group>

        <Form.Group controlId="valid_from" className="form-group">
          <Form.Label>الفترة من</Form.Label>
          <Form.Control
            type="date"
            placeholder="أدخل تاريخ بداية التصديق الأمني"
            {...register("valid_from")}
            className={`form-control ${errors.valid_from ? 'is-invalid' : ''}`}
          />
          {errors.valid_from && <div className="invalid-feedback">{errors.valid_from.message}</div>}
        </Form.Group>

        <Form.Group controlId="valid_through" className="form-group">
          <Form.Label>الفترة إلى</Form.Label>
          <Form.Control
            type="date"
            placeholder="أدخل تاريخ انتهاء التصديق الأمني"
            {...register("valid_through")}
            className={`form-control ${errors.valid_through ? 'is-invalid' : ''}`}
          />
          {errors.valid_through && <div className="invalid-feedback">{errors.valid_through.message}</div>}
        </Form.Group>

         <Form.Group controlId="department">
                                  <Form.Label>مكان التواجد</Form.Label>
                                  <Form.Control
                                    as="select"
                                    {...register('department')}
                                    className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                                  >
                                    <option value="">إختر الورشة / الفرع</option>
                                    {dept.map((dep) => (
                                      <option key={dep.name} value={dep.name}>
                                        {dep.name}
                                      </option>
                                    ))}
                                  </Form.Control>
                                  {errors.department && <div className="invalid-feedback">{errors.department.message}</div>}
                                </Form.Group>

        <Form.Group controlId="company_name" className="form-group">
          <Form.Label>اسم الشركة</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الشركة"
            {...register("company_name")}
            className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
          />
          {errors.company_name && <div className="invalid-feedback">{errors.company_name.message}</div>}
        </Form.Group>

        <Button variant="primary" type="submit" className="submit-btn" disabled={expert.loading}>
          {expert.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddExperts;
