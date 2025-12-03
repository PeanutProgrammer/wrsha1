import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, } from 'react-bootstrap';
import './Civillian.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import DatePicker from 'react-datepicker';
import "react-datetime/css/react-datetime.css";
import { ar } from 'date-fns/locale';  // Import Arabic locale from date-fns
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';


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
  telephone_number: yup.string().required('رقم الهاتف مطلوب'),
});

const AddCivillians = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [civillian, setCivillian] = useState({
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
  const createCivillian = async (data) => {
    setCivillian({ ...civillian, loading: true });

      const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToLocalString(data.join_date) : '',
    dob: data.dob ? formatDateToLocalString(data.dob) : '',
  valid_from: data.valid_from ? formatDateToLocalString(data.valid_from) : '',
  valid_through: data.valid_through ? formatDateToLocalString(data.valid_through) : '',
  };

    try {
      await axios.post('http://192.168.1.3:4001/civillian/', formattedData, {
        headers: {
          token: auth.token,
        },
      });

      setCivillian({
        loading: false,
        err: [],
        success: 'تمت الإضافة بنجاح!',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000);
    } catch (err) {
      setCivillian({
        loading: false,
        err: err.response ? err.response.data.errors : ['حدث خطأ ما. يرجى المحاولة لاحقًا.'],
        success: null,
      });
    }
  };

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
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة مدني جديد</h1>
      
      {/* Display Errors */}
      {civillian.err.length > 0 && (
        <Alert variant="danger" className="p-2">
          <ul>
            {civillian.err.map((error, index) => (
              <li key={index}>{error.msg || error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Display Success Message */}
      {civillian.success && (
        <Alert variant="success" className="p-2">
          {civillian.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(createCivillian)} className="form">
        <Form.Group controlId="nationalID" className="form-group">
          <Form.Label>الرقم القومي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم القومي"
            {...register("nationalID")}
            className={`form-control ${errors.nationalID ? 'is-invalid' : ''}`}
          />
          {errors.nationalID && <div className="invalid-feedback">{errors.nationalID.message}</div>}
        </Form.Group>

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم المدني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المدني"
            {...register("name")}
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

        
        <Form.Group controlId="join_date" className="form-group">
          <Form.Label>تاريخ الضم</Form.Label>
          <Form.Control
            type="date"
            {...register("join_date")}
            className={`form-control ${errors.join_date ? 'is-invalid' : ''}`}
          />
          {errors.join_date && <div className="invalid-feedback">{errors.join_date.message}</div>}
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
        <Form.Group controlId="dob" className="form-group">
          <Form.Label>تاريخ الميلاد</Form.Label>
          <Form.Control
            type="date"
            {...register("dob")}
            className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
          />
          {errors.dob && <div className="invalid-feedback">{errors.dob.message}</div>}
        </Form.Group>


        <Form.Group controlId="address" className="form-group">
           <Form.Label>العنوان</Form.Label>
            <Form.Control
                        type="text"
            placeholder="أدخل العنوان"
            {...register("address")}
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
          />
          {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
        </Form.Group>

        <Form.Group controlId="telephone_number" className="form-group">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم الهاتف"
             {...register("telephone_number")}
            className={`form-control ${errors.telephone_number ? 'is-invalid' : ''}`}
          />
          {errors.telephone_number && <div className="invalid-feedback">{errors.telephone_number.message}</div>}
        </Form.Group>




        <Button variant="primary" type="submit" className="submit-btn" disabled={civillian.loading}>
          {civillian.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddCivillians;
