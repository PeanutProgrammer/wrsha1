import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Soldier.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";

// Validation schema using yup
const schema = yup.object().shape({
  name: yup.string().min(3, 'اسم الجندي  يجب أن يكون أكثر من 3 حروف').max(30, 'اسم الجندي  يجب ألا يتجاوز 30 حرف').required('اسم الجندي  مطلوب'),
  rank: yup.string().required('الدرجة مطلوبة'),
  mil_id: yup.string().matches(/^\d+$/, 'الرقم العسكري يجب أن يحتوي على أرقام فقط').required('الرقم العسكري مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  join_date: yup.date().required('تاريخ الضم مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  end_date: yup.date().required('تاريخ التسريح مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  telephone_number: yup.string().required('رقم الهاتف مطلوب'),
  guardian_name: yup.string().required('اسم ولي الأمر مطلوب'),
  guardian_telephone_number: yup.string().required('رقم ولي الأمر مطلوب')

});

const AddSoldiers = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [soldier, setSoldier] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    end_date: '',
    telephone_number: '',
    guardian_name: '',
    guardian_telephone_number: '',
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
  return `${year}-${month}-${day}`;
};

   // Handle form submission
  const createSoldier = async (data) => {
    setSoldier({ ...soldier, loading: true });

      console.log("Request Data:", data);

  // Format the dates (join_date and dob) to yyyy-MM-DD format
  const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToLocalString(data.join_date) : '',
    end_date: data.end_date ? formatDateToLocalString(data.end_date) : ''
  };

  // Log the formatted data
  console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post('http://192.168.1.3:4001/Soldier/', formattedData, {
        headers: { token: auth.token },
      });

      setSoldier({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        name: '',
        rank: '',
        mil_id: '',
        department: '',
        join_date: '',
        end_date: '',
        telephone_number: '',
        guardian_name: '',
        guardian_telephone_number: '',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setSoldier({
        ...soldier,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
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
      <h1 className="text-center mb-4">إضافة جندي جديد</h1>

      {/* Display Errors */}
      {soldier.err && (
        <Alert variant="danger" className="p-2">
          {soldier.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {soldier.success && (
        <Alert variant="success" className="p-2">
          {soldier.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createSoldier)} className="form">
        <Form.Group controlId="mil_id" className="form-group">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            {...register("mil_id")}
            className={`form-control ${errors.mil_id ? 'is-invalid' : ''}`}
          />
          {errors.mil_id && <div className="invalid-feedback">{errors.mil_id.message}</div>}
        </Form.Group>

        <Form.Group controlId="rank" className="form-group">
          <Form.Label>الدرجة</Form.Label>
          <Form.Control
            as="select"
            {...register("rank")}
            className={`form-control ${errors.rank ? 'is-invalid' : ''}`}
          >
            <option value="">إختر درجة الجندي</option>
            <option value="جندي">جندي</option>
            <option value="عريف مجند">عريف مجند</option>
          </Form.Control>
          {errors.rank && <div className="invalid-feedback">{errors.rank.message}</div>}
        </Form.Group>

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم الجندي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الجندي"
            {...register("name")}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </Form.Group>

        <Form.Group controlId="department" className="form-group">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            {...register("department")}
            className={`form-control ${errors.department ? 'is-invalid' : ''}`}
          >
            <option value="">إختر الورشة / الفرع</option>
            {dept.map((dep) => (
              <option key={dep.name} value={dep.name}>{dep.name}</option>
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

        <Form.Group controlId="end_date" className="form-group">
          <Form.Label>تاريخ التسريح</Form.Label>
          <Form.Control
            type="date"
            {...register("end_date")}
            className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
          />
          {errors.end_date && <div className="invalid-feedback">{errors.end_date.message}</div>}
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


        <Form.Group controlId="guardian_name" className="form-group">
          <Form.Label>اسم ولي الأمر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم ولي الأمر "
             {...register("guardian_name")}
            className={`form-control ${errors.guardian_name ? 'is-invalid' : ''}`}
          />
          {errors.guardian_name && <div className="invalid-feedback">{errors.guardian_name.message}</div>}


        </Form.Group>


        <Form.Group controlId="guardian_telephone_number" className="form-group">
          <Form.Label>رقم ولي الأمر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم ولي الأمر "
             {...register("guardian_telephone_number")}
            className={`form-control ${errors.guardian_telephone_number ? 'is-invalid' : ''}`}
          />
          {errors.guardian_telephone_number && <div className="invalid-feedback">{errors.guardian_telephone_number.message}</div>}


        </Form.Group>



        {/* Submit Button */}
        <Button type="submit" variant="primary" className='submit-btn' disabled={soldier.loading}>
          {soldier.loading ? 'جاري الإضافة...' : 'إضافة الجندي'}
        </Button>
      </Form>
    </div>
  );
};

export default AddSoldiers;
