import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './UpdateNCOs.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
  import moment from 'moment';

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string().min(3, 'اسم ضابط الصف يجب أن يكون أكثر من 3 حروف').max(30, 'اسم ضابط الصف يجب ألا يتجاوز 30 حرف').required('اسم ضابط الصف مطلوب'),
  rank: yup.string().required('الدرجة مطلوبة'),
  mil_id: yup.string().matches(/^\d+$/, 'الرقم العسكري يجب أن يحتوي على أرقام فقط').required('الرقم العسكري مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  join_date: yup.date().required('تاريخ الضم مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  address: yup.string().required('العنوان مطلوب'),
  height: yup.number().typeError('الطول يجب أن يكون رقماً').required('الطول مطلوب'),
  weight: yup.number().typeError('الوزن يجب أن يكون رقماً').required('الوزن مطلوب'),
  dob: yup.date().required('تاريخ الميلاد مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
});

const UpdateOfficers = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [dept, setDept] = useState([]);
  const [officer, setOfficer] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',  // store as string "YYYY-MM-DD"
    address: '',
    height: '',
    weight: '',
    dob: '',
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

  const updateOfficers = (data) => {
    setOfficer({ ...officer, loading: true });

          console.log("Request Data:", data);

           const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToInput(data.join_date) : '',
    dob: data.dob ? formatDateToInput(data.dob) : '',
  };



    axios
      .put('http://localhost:4001/NCO/' + id, formattedData, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficer({
          ...officer,
          loading: false,
          success: 'تم تعديل بيانات ضابط الصف بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setOfficer({
          ...officer,
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
      .get('http://localhost:4001/NCO/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficer({
          ...officer,
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          address: resp.data._address,
          height: resp.data._height,
          weight: resp.data._weight,
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
        });
        reset({
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          address: resp.data._address,
          height: resp.data._height,
          weight: resp.data._weight,
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
        });
      })
      .catch((err) => {
        setOfficer({
          ...officer,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  }, [id, officer.reload, reset]);

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
      <h1 className="text-center p-2">تعديل بيانات ضابط الصف</h1>

      {officer.err && (
        <Alert variant="danger" className="p-2">
          {officer.err}
        </Alert>
      )}
      {officer.success && (
        <Alert variant="success" className="p-2">
          {officer.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(updateOfficers)}>
        <Form.Group controlId="mil_id">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            {...register('mil_id')}
            className={`form-control ${errors.mil_id ? 'is-invalid' : ''}`}
            disabled
          />
          {errors.mil_id && <div className="invalid-feedback">{errors.mil_id.message}</div>}
        </Form.Group>



        <Form.Group controlId="rank">
          <Form.Label>درجة ضابط الصف</Form.Label>
          <Form.Control
            as="select"
            {...register('rank')}
            className={`form-control ${errors.rank ? 'is-invalid' : ''}`}
          >
            <option value="">إختر درجة ضابط الصف</option>
            <option value="عريف">عريف</option>
            <option value="رقيب">رقيب</option>
            <option value="رقيب أول">رقيب أول</option> 
            <option value="مساعد">مساعد</option> 
            <option value="مساعد أول">مساعد أول</option> 
            <option value="صانع ماهر">صانع ماهر</option> 
            <option value="صانع دقيق">صانع دقيق</option> 
            <option value="ملاحظ">ملاحظ</option> 
            <option value="ملاحظ فني">ملاحظ فني</option> 
          </Form.Control>
          {errors.rank && <div className="invalid-feedback">{errors.rank.message}</div>}
        </Form.Group>

        <Form.Group controlId="name">
          <Form.Label>إسم ضابط الصف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم ضابط الصف"
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

        <Form.Group controlId="height" className="form-group">
          <Form.Label>الطول</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الطول"
            {...register('height')}
            className={`form-control ${errors.height ? 'is-invalid' : ''}`}
          />
          {errors.height && <div className="invalid-feedback">{errors.height.message}</div>}
        </Form.Group>

        <Form.Group controlId="weight" className="form-group">
          <Form.Label>الوزن</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الوزن"
            {...register('weight')}
            className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
          />
          {errors.weight && <div className="invalid-feedback">{errors.weight.message}</div>}
        </Form.Group>

        <Form.Group controlId="dob" className="form-group">
          <Form.Label>تاريخ الميلاد</Form.Label>
          <Form.Control
            type="date"
            placeholder="أدخل تاريخ الميلاد"
            {...register('dob')}
            className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
          />
          {errors.dob && <div className="invalid-feedback">{errors.dob.message}</div>}
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3" disabled={officer.loading}>
          {officer.loading ? 'جاري التعديل...' : 'تعديل ضابط الصف'}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateOfficers;
