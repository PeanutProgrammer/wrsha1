import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Users.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string()
    .min(3, 'الاسم  يجب أن يكون أكثر من 3 حروف')  // Name must be more than 3 characters
    .max(30, 'الاسم يجب ألا يتجاوز 30 حرف')  // Name must not exceed 30 characters
    .required('الاسم مطلوب'),  // Name is required

  username: yup.string()
    .required('اسم المستخدم  مطلوب')  // Username is required
    .min(5, 'اسم المستخدم يجب أن يكون أكثر من 5 حروف')  // Username must be more than 5 characters
    .max(15, 'اسم المستخدم يجب ألا يتجاوز 15 حرف'),  // Username must not exceed 15 characters

  password: yup.string()
    .min(8, 'كلمة المرور يجب أن تحتوي على 8 حروف على الأقل')  // Password must be at least 8 characters
    .matches(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')  // Password must contain at least one lowercase letter
    .matches(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')  // Password must contain at least one uppercase letter
    .matches(/\d/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')  // Password must contain at least one number
    .required('كلمة المرور مطلوبة'),  // Password is required

  type: yup.string()
    .oneOf([
      'admin', 
      'بوابة', 
      'مبنى القيادة', 
      'شؤون ضباط', 
      'شؤون ادارية', 
      'قائد الأمن'
    ], 'النوع يجب أن يكون "admin" أو "بوابة" أو "مبنى القيادة" أو "شؤون ضباط" أو "شؤون ادارية" أو "قائد الأمن"')  // Type must be one of the above values
    .required('النوع مطلوب')  // Type is required
});


const AddUsers = () => {
  const auth = getAuthUser();
  const [user, setUser] = useState({
    loading: false,
    err: '',
    name: '',
    username: '',
    password: '',
    type: '',
    success: null,
  });

   const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  console.log("Form errors:", errors); // Log to see any validation issues





   // Handle form submission
  const createUser = async (data) => {
          console.log("Request Data:", data);

    setUser({ ...user, loading: true });

      console.log("Request Data:", data);



  // Log the formatted data
  console.log("Formatted Request Data:", data);


    try {
      await axios.post('http://localhost:4001/User/', data, {
        headers: { token: auth.token },
      });

      setUser({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        name: '',
        username: '',
        password: '',
        type: '',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setUser({
        ...user,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
        success: null,
      });
    }
  };

 

   return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة مستخدم جديد</h1>

      {/* Display Errors */}
      {user.err && (
        <Alert variant="danger" className="p-2">
          {user.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {user.success && (
        <Alert variant="success" className="p-2">
          {user.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createUser)} className="form">
       

       

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
          <Form.Control
            type="password"
            placeholder='أدخل كلمة السر'
            {...register("password")}
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          />
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
            <option value="قائد الأمن">قائد الأمن</option>
            
          </Form.Control>
          {errors.type && <div className="invalid-feedback">{errors.type.message}</div>}
        </Form.Group>


      
        {/* Submit Button */}
        <Button type="submit" variant="primary" className='submit-btn' disabled={user.loading}>
          {user.loading ? 'جاري الإضافة...' : 'إضافة المستخدم'}
        </Button>
      </Form>
    </div>
  );
};

export default AddUsers;
