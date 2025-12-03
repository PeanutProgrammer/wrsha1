import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './UpdateCivillians.css';
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
  name: yup.string().min(3, 'اسم المدني يجب أن يكون أكثر من 3 حروف').max(30, 'اسم المدني يجب ألا يتجاوز 30 حرف').required('اسم المدني مطلوب'),
  security_clearance_number: yup.string().required('رقم التصديق الأمني مطلوب'),
  valid_from: yup.date().required('تاريخ بداية التصديق الأمني مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  valid_through: yup.date().required('تاريخ انتهاء التصديق الأمني مطلوب').min(yup.ref('valid_from'), 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية').typeError('يرجى إدخال تاريخ صحيح'),
  dob: yup.date().required('تاريخ الميلاد مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  join_date: yup.date().required('تاريخ الضم مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  address: yup.string().required('العنوان مطلوب'),
  telephone_number: yup.string().required('رقم الهاتف مطلوب').typeError('يرجى إدخال رقم هاتف صحيح'),
});

const UpdateCivillians = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [dept, setDept] = useState([]);
  const [civillian, setCivillian] = useState({
    loading: false,
    err: '',
    nationalID: '',
    name: '',
    security_clearance_number: '',
    valid_from: '',
    valid_through: '',
    dob: '',
    department: '',
    join_date: '',
    telephone_number: '',
    address: '',
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

  const updateCivillians = (data) => {
    setCivillian({ ...civillian, loading: true });

          console.log("Request Data:", data);

           const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToInput(data.join_date) : '',
    dob: data.dob ? formatDateToInput(data.dob) : '',
    valid_from: data.valid_from ? formatDateToInput(data.valid_from) : '',
    valid_through: data.valid_through ? formatDateToInput(data.valid_through) : ''
  };



    axios
      .put('http://192.168.1.3:4001/Civillian/' + id, formattedData, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillian({
          ...civillian,
          loading: false,
          success: 'تم تعديل بيانات المدني بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setCivillian({
          ...civillian,
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
      .get('http://192.168.1.3:4001/Civillian/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillian({
          ...civillian,
          nationalID: resp.data._nationalID,
          name: resp.data._name,
          security_clearance_number: resp.data._security_clearance_number,
          valid_from: resp.data._valid_from ? formatDateToInput(resp.data._valid_from) : '',
          valid_through: resp.data._valid_through ? formatDateToInput(resp.data._valid_through) : '',
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          telephone_number: resp.data._telephone_number,
          address: resp.data._address,
          loading: false,
          err: '',
        });
        reset({
          nationalID: resp.data._nationalID,
          name: resp.data._name,
          security_clearance_number: resp.data._security_clearance_number,
          valid_from: resp.data._valid_from ? formatDateToInput(resp.data._valid_from) : '',
          valid_through: resp.data._valid_through ? formatDateToInput(resp.data._valid_through) : '',
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          telephone_number: resp.data._telephone_number,
          address: resp.data._address
        });
      })
      .catch((err) => {
        setCivillian({
          ...civillian,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  }, [id, civillian.reload, reset]);

  useEffect(() => {
    axios
      .get('http://192.168.1.3:4001/department/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setDept(resp.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="Update">
      <h1 className="text-center p-2">تعديل بيانات المدني</h1>

      {civillian.err && (
        <Alert variant="danger" className="p-2">
          {civillian.err}
        </Alert>
      )}
      {civillian.success && (
        <Alert variant="success" className="p-2">
          {civillian.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(updateCivillians)}>
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
          <Form.Label>إسم المدني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم المدني"
            {...register('name')}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
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

        <Form.Group controlId="join_date">
          <Form.Label>تاريخ الضم</Form.Label>
          <Form.Control
            type="date"
            {...register('join_date')}
            className={`form-control ${errors.join_date ? 'is-invalid' : ''}`}
          />
          {errors.join_date && <div className="invalid-feedback">{errors.join_date.message}</div>}
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

                <Form.Group controlId="dob">
          <Form.Label>تاريخ الميلاد</Form.Label>
          <Form.Control
            type="date"
            {...register('dob')}
            className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
          />
          {errors.dob && <div className="invalid-feedback">{errors.dob.message}</div>}
        </Form.Group>

        <Form.Group controlId="address" className="form-group">
          <Form.Label>العنوان</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل العنوان"
            {...register('address')}
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
          />
          {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
        </Form.Group>



        <Form.Group controlId="telephone_number" className="form-group">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم الهاتف"
            {...register('telephone_number')}
            className={`form-control ${errors.telephone_number ? 'is-invalid' : ''}`}
          />
          {errors.telephone_number && <div className="invalid-feedback">{errors.telephone_number.message}</div>}
        </Form.Group>



      

        <Button variant="primary" type="submit" className="mt-3" disabled={civillian.loading}>
          {civillian.loading ? 'جاري التعديل...' : 'تعديل المدني'}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateCivillians;
