import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import "../../style/update.css";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
  import moment from 'moment';
import autoTable from 'jspdf-autotable';

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
  guardian_telephone_number: yup.string().required('رقم ولي الأمر مطلوب'),
  attached: yup.boolean().required(),

});

const UpdateSoldiers = () => {
  const auth = getAuthUser();
  let { id } = useParams();

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
    attached: false,
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

  const updateSoldiers = (data) => {
    setSoldier({ ...soldier, loading: true });

          console.log("Request Data:", data);

           const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToInput(data.join_date) : '',
             end_date: data.end_date ? formatDateToInput(data.end_date) : '',
    attached: data.attached === true ? true : false, // default to false if unchecked
  };



    axios
      .put(`${process.env.REACT_APP_BACKEND_BASE_URL}/Soldier/` + id, formattedData, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldier({
          ...soldier,
          loading: false,
          success: 'تم تعديل بيانات الجندي بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setSoldier({
          ...soldier,
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
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/Soldier/` + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldier({
          ...soldier,
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          end_date: resp.data._end_date ? formatDateToInput(resp.data._end_date) : '',
          telephone_number: resp.data._telephone_number,
          guardian_name: resp.data._guardian_name,
          guardian_telephone_number: resp.data._guardian_telephone_number,
          attached: resp.data._attached,
          loading: false,
        });
        reset({
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          end_date: resp.data._end_date ? formatDateToInput(resp.data._end_date) : '',
          telephone_number: resp.data._telephone_number,
          guardian_name: resp.data._guardian_name,
          guardian_telephone_number: resp.data._guardian_telephone_number,
          attached: resp.data._attached,
        });
      })
      .catch((err) => {
        setSoldier({
          ...soldier,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  }, [id, soldier.reload, reset]);

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
    <div className="Update">
      <h1 className="text-center p-2">تعديل بيانات الجندي</h1>

      {soldier.err && (
        <Alert variant="danger" className="p-2">
          {soldier.err}
        </Alert>
      )}
      {soldier.success && (
        <Alert variant="success" className="p-2">
          {soldier.success}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit(updateSoldiers)}>
       <Form.Group controlId="mil_id">
  <Form.Label>الرقم العسكري</Form.Label>
  <Form.Control
    type="text"
    placeholder="أدخل الرقم العسكري"
    {...register('mil_id')}
    className={`form-control ${errors.mil_id ? 'is-invalid' : ''}`}
    disabled // Make it uneditable
  />
  {errors.mil_id && <div className="invalid-feedback">{errors.mil_id.message}</div>}
</Form.Group>



        <Form.Group controlId="rank">
          <Form.Label>درجة الجندي</Form.Label>
          <Form.Control
            as="select"
            {...register('rank')}
            className={`form-control ${errors.rank ? 'is-invalid' : ''}`}
          >
            <option value="">إختر درجة الجندي</option>
            <option value="جندي">جندي</option>
            <option value="عريف مجند">عريف مجند</option> 
          </Form.Control>
          {errors.rank && <div className="invalid-feedback">{errors.rank.message}</div>}
        </Form.Group>

        <Form.Group controlId="name">
          <Form.Label>إسم الجندي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم الجندي"
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


        <Form.Group controlId="end_date">
          <Form.Label>تاريخ التسريح</Form.Label>
          <Form.Control
            type="date"
            {...register('end_date')}
            className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
          />
          {errors.end_date && <div className="invalid-feedback">{errors.end_date.message}</div>}
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
        <Form.Group controlId="guardian_name" className="form-group">
          <Form.Label>اسم ولي الأمر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم ولي الأمر"
            {...register('guardian_name')}
            className={`form-control ${errors.guardian_name ? 'is-invalid' : ''}`}
          />
          {errors.guardian_name && <div className="invalid-feedback">{errors.guardian_name.message}</div>}
        </Form.Group>

        <Form.Group controlId="guardian_telephone_number" className="form-group">
          <Form.Label>رقم هاتف ولي الأمر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم هاتف ولي الأمر"
            {...register('guardian_telephone_number')}
            className={`form-control ${errors.guardian_telephone_number ? 'is-invalid' : ''}`}
          />
          {errors.guardian_telephone_number && <div className="invalid-feedback">{errors.guardian_telephone_number.message}</div>}
        </Form.Group>

                <Form.Group controlId="attached" className="form-group">
                  <Form.Label>هل الجندي ملحق؟</Form.Label>
                  <Form.Control
                    as="select"
                    {...register("attached")}
                    className="form-control"
                  >
                    <option value="">إختر</option> {/* optional default */}
                    <option value={true}>نعم</option>
                    <option value={false}>لا</option>
                  </Form.Control>
                </Form.Group>


      

        <Button variant="primary" type="submit" className="mt-3" disabled={soldier.loading}>
          {soldier.loading ? 'جاري التعديل...' : 'تعديل الجندي'}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateSoldiers;
