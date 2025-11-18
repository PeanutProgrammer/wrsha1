import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './UpdateExperts.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
  import moment from 'moment';

// Validation schema using yup
const schema = yup.object().shape({
  nationalID: yup.string().matches(/^\d+$/, 'الرقم القومي يجب أن يحتوي على أرقام فقط').required('الرقم القومي مطلوب'),
  name: yup.string().min(3, 'اسم الخبير يجب أن يكون أكثر من 3 حروف').max(30, 'اسم الخبير يجب ألا يتجاوز 30 حرف').required('اسم الخبير مطلوب'),
  passport_number: yup.string().min(6, 'رقم جواز السفر يجب أن يكون على الأقل 6 أحرف').required('رقم جواز السفر مطلوب'),
  security_clearance_number: yup.string().required('رقم التصديق الأمني مطلوب'),
  valid_from: yup.date().required('تاريخ بداية التصديق الأمني مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  valid_through: yup.date().required('تاريخ انتهاء التصديق الأمني مطلوب').min(yup.ref('valid_from'), 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية').typeError('يرجى إدخال تاريخ صحيح'),
  company_name: yup.string().required('اسم الشركة مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  
});

const UpdateExperts = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);

  let { id } = useParams();

  const [expert, setExpert] = useState({
    loading: false,
    err: '',
    nationalID: '',
    name: '',
    passport_number: '',
    security_clearance_number: '',
    valid_from: '',
    valid_through: '',
    company_name: '',
    department: '',
    success: null,
    reload: false,
  });

  // Use Form Hook from react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const formatDateToInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateExperts = (data) => {
    setExpert({ ...expert, loading: true });

          console.log("Request Data:", data);

    const formattedData = {
      ...data,
      valid_from: data.valid_from ? formatDateToInput(data.valid_from) : '',
      valid_through: data.valid_through ? formatDateToInput(data.valid_through) : '',
    };



    axios
      .put('http://localhost:4001/Expert/' + id, formattedData, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {

        console.log("API Response:", resp.data);  // Log the full response to verify field names

        setExpert({
          ...expert,
          loading: false,
          success: 'تم تعديل بيانات الخبير بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setExpert({
          ...expert,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/Expert/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {


        setExpert({
          ...expert,
          nationalID: resp.data._nationalID,
          name: resp.data._name,
          passport_number: resp.data.passport_number,
          security_clearance_number: resp.data._security_clearance_number,
          valid_from: resp.data._valid_from ? formatDateToInput(resp.data._valid_from) : '',
          valid_through: resp.data._valid_through ? formatDateToInput(resp.data._valid_through) : '',
          company_name: resp.data._company_name,
          department: resp.data._department,
          loading: false,
          err: '',
        });
        reset({
          nationalID: resp.data._nationalID,
          name: resp.data._name,
          passport_number: resp.data._passport_number,
          security_clearance_number: resp.data._security_clearance_number,
          valid_from: resp.data._valid_from ? formatDateToInput(resp.data._valid_from) : '',
          valid_through: resp.data._valid_through ? formatDateToInput(resp.data._valid_through) : '',
          company_name: resp.data._company_name,
          department: resp.data._department,
        });
      })
      .catch((err) => {
        setExpert({
          ...expert,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  }, [id, expert.reload, reset]);

   useEffect(() => {
          axios
            .get('http://localhost:4001/department/', {
              headers: {
                token: auth.token,
              },
            })
            .then((resp) => setDept(resp.data))
            .catch((err) => console.log(err));
        }, []);


  return (
    <div className="Update">
      <h1 className="text-center p-2">تعديل بيانات الخبير</h1>

      {expert.err && (
        <Alert variant="danger" className="p-2">
          {expert.err}
        </Alert>
      )}
      {expert.success && (
        <Alert variant="success" className="p-2">
          {expert.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(updateExperts)}>
       <Form.Group controlId="nationalID">
  <Form.Label>الرقم القومي</Form.Label>
  <Form.Control
    type="text"
    placeholder="أدخل الرقم القومي"
    {...register('nationalID')}
    className={`form-control ${errors.nationalID ? 'is-invalid' : ''}`}
    disabled // Make it uneditable
  />
  {errors.nationalID && <div className="invalid-feedback">{errors.nationalID.message}</div>}
</Form.Group>




        <Form.Group controlId="name">
          <Form.Label>إسم الخبير</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم الخبير"
            {...register('name')}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </Form.Group>

        <Form.Group controlId="passport_number" className="form-group">
          <Form.Label>رقم جواز السفر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم جواز السفر"
            {...register('passport_number')}
            className={`form-control ${errors.passport_number ? 'is-invalid' : ''}`}
          />
          {errors.passport_number && <div className="invalid-feedback">{errors.passport_number.message}</div>}
        </Form.Group>

        <Form.Group controlId="security_clearance_number" className="form-group">
          <Form.Label>رقم التصديق الأمني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم التصديق الأمني"
            {...register('security_clearance_number')}
            className={`form-control ${errors.security_clearance_number ? 'is-invalid' : ''}`}
          />
          {errors.security_clearance_number && <div className="invalid-feedback">{errors.security_clearance_number.message}</div>}
        </Form.Group>

        <Form.Group controlId="valid_from" className="form-group">
          <Form.Label>الفترة من</Form.Label>
          <Form.Control
            type="date"
            placeholder="أدخل تاريخ بداية التصديق الأمني"
            {...register('valid_from')}
            className={`form-control ${errors.valid_from ? 'is-invalid' : ''}`}
          />
          {errors.valid_from && <div className="invalid-feedback">{errors.valid_from.message}</div>}
        </Form.Group>

        <Form.Group controlId="valid_through" className="form-group">
          <Form.Label>الفترة إلى</Form.Label>
          <Form.Control
            type="date"
            placeholder="أدخل تاريخ انتهاء التصديق الأمني"
            {...register('valid_through')}
            className={`form-control ${errors.valid_through ? 'is-invalid' : ''}`}
          />
          {errors.valid_through && <div className="invalid-feedback">{errors.valid_through.message}</div>}
        </Form.Group>


         <Form.Group controlId="department">
                                          <Form.Label>الورشة / الفرع</Form.Label>
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
            {...register('company_name')}
            className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
          />
          {errors.company_name && <div className="invalid-feedback">{errors.company_name.message}</div>}
        </Form.Group>



      

        <Button variant="primary" type="submit" className="mt-3" disabled={expert.loading}>
          {expert.loading ? 'جاري التعديل...' : 'تعديل الخبير'}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateExperts;
