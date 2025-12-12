import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import '../../style/update.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string()
    .min(3, 'الاسم يجب أن يكون أكثر من 3 حروف')  
    .max(30, 'الاسم يجب ألا يتجاوز 30 حرف')  
    .required('الاسم مطلوب'),  

  username: yup.string()
    .required('اسم المستخدم مطلوب')  
    .min(3, 'اسم المستخدم يجب أن يكون أكثر من 3 حروف')  
    .max(15, 'اسم المستخدم يجب ألا يتجاوز 15 حرف'),  

  password: yup.string()
    .min(8, 'كلمة المرور يجب أن تحتوي على 8 حروف على الأقل')  
    .matches(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')  
    .matches(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')  
    .matches(/\d/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')  
    .required('كلمة المرور مطلوبة'),  

  type: yup.string()
    .oneOf([
      'admin', 
      'بوابة', 
      'مبنى القيادة', 
      'شؤون ضباط', 
      'شؤون ادارية', 
      'قائد الأمن'
    ], 'النوع يجب أن يكون "admin" أو "بوابة" أو "مبنى القيادة" أو "شؤون ضباط" أو "شؤون ادارية" أو "قائد الأمن"')  
    .required('النوع مطلوب')  
});

const UpdateUsers = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [user, setUser] = useState({
    loading: false,
    err: '',
    name: '',
    username: '',
    password: '',
    type: '',
    success: null,
  });

  const [passwordVisible, setPasswordVisible] = useState(false); // To toggle password visibility

  // Use Form Hook from react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const updateUsers = (data) => {
    setUser({ ...user, loading: true });

    axios
      .put(`${process.env.REACT_APP_BACKEND_BASE_URL}/User/` + id, data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUser({
          ...user,
          loading: false,
          success: 'تم تعديل بيانات المستخدم بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setUser({
          ...user,
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
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/User/` + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setUser({
          ...user,
          username: resp.data._username,
          name: resp.data._name,
          password: resp.data._password,
          type: resp.data._type,
        });
        reset({
          username: resp.data._username,
          name: resp.data._name,
          password: resp.data._password,
          type: resp.data._type,
        });
      })
      .catch((err) => {
        setUser({
          ...user,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  }, [id, user.reload, reset]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="Update">
      <h1 className="text-center p-2">تعديل بيانات المستخدم</h1>

      {user.err && (
        <Alert variant="danger" className="p-2">
          {user.err}
        </Alert>
      )}
      {user.success && (
        <Alert variant="success" className="p-2">
          {user.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(updateUsers)}>
        <Form.Group controlId="name" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الاسم"
            {...register("name")}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </Form.Group>
       
        <Form.Group controlId="department" className="form-group">
          <Form.Label>اسم المستخدم</Form.Label>
          <Form.Control
            type='text'
            placeholder='أدخل اسم المستخدم'
            {...register("username")}
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
          />
          {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
        </Form.Group>
       
        <Form.Group controlId="password" className="form-group">
          <Form.Label>كلمة السر</Form.Label>
          <div className="password-field">
            <Form.Control
              type={passwordVisible ? "text" : "password"}  // If passwordVisible is true, show the password, otherwise mask it
              placeholder='أدخل كلمة السر'
              {...register("password")}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            />
            <Button variant="link" onClick={togglePasswordVisibility} className="password-toggle">
              {passwordVisible ? 'إخفاء' : 'إظهار'}
            </Button>
          </div>
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </Form.Group>
       
        <Form.Group controlId="type" className="form-group">
          <Form.Label>نوع المستخدم</Form.Label>
          <Form.Control
            as="select"
            {...register("type")}
            className={`form-control ${errors.type ? 'is-invalid' : ''}`}
          >
            <option value="">إختر نوع المستخدم</option>
            <option value="admin">Admin</option>
            <option value="بوابة">بوابة</option>
            <option value="مبنى القيادة">مبنى القيادة</option>
            <option value="شؤون ضباط">شؤون ضباط</option>
            <option value="شؤون ادارية">شؤون ادارية</option>
            <option value="قائد الامن">قائد الامن</option>
          </Form.Control>
          {errors.type && <div className="invalid-feedback">{errors.type.message}</div>}
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3" disabled={user.loading}>
          {user.loading ? 'جاري التعديل...' : 'تعديل المستخدم'}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateUsers;
