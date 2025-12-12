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
  name: yup.string().min(3, 'اسم ضابط صف الصف يجب أن يكون أكثر من 3 حروف').max(30, 'اسم ضابط صف الصف يجب ألا يتجاوز 30 حرف').required('اسم ضابط صف الصف مطلوب'),
  rank: yup.string().required('الدرجة مطلوبة'),
  mil_id: yup.string().matches(/^\d+$/, 'الرقم العسكري يجب أن يحتوي على أرقام فقط').required('الرقم العسكري مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  join_date: yup.date().required('تاريخ الضم مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  address: yup.string().required('العنوان مطلوب'),
  dob: yup.date().required('تاريخ الميلاد مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  attached: yup.boolean().required('حقل الملحق مطلوب'),
});

const AddNCOs = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [nco, setNCO] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    address: '',
    dob: '',
    attached: false,
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
  const createNCO = async (data) => {
    setNCO({ ...nco, loading: true });

      console.log("Request Data:", data);

  // Format the dates (join_date and dob) to yyyy-MM-DD format
  const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToLocalString(data.join_date) : "",
    dob: data.dob ? formatDateToLocalString(data.dob) : "",
    attached: data.attached === true ? true : false, // default to false if unchecked
  };

  // Log the formatted data
  console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/NCO/`, formattedData, {
        headers: { token: auth.token },
      });

      setNCO({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        name: '',
        rank: '',
        mil_id: '',
        department: '',
        join_date: '',
        address: '',
        dob: '',
        attached: false,
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setNCO({
        ...nco,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
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
       <h1 className="text-center mb-4">إضافة ضابط صف جديد</h1>

       {/* Display Errors */}
       {nco.err && (
         <Alert variant="danger" className="p-2">
           {nco.err}
         </Alert>
       )}

       {/* Display Success Message */}
       {nco.success && (
         <Alert variant="success" className="p-2">
           {nco.success}
         </Alert>
       )}

       <Form onSubmit={handleSubmit(createNCO)} className="form">
         <Form.Group controlId="mil_id" className="form-group">
           <Form.Label>الرقم العسكري</Form.Label>
           <Form.Control
             type="text"
             placeholder="أدخل الرقم العسكري"
             {...register("mil_id")}
             className={`form-control ${errors.mil_id ? "is-invalid" : ""}`}
           />
           {errors.mil_id && (
             <div className="invalid-feedback">{errors.mil_id.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="rank" className="form-group">
           <Form.Label>الدرجة</Form.Label>
           <Form.Control
             as="select"
             {...register("rank")}
             className={`form-control ${errors.rank ? "is-invalid" : ""}`}
           >
             <option value="">إختر درجة ضابط الصف</option>
             <option value="عريف">عريف</option>
             <option value="رقيب">رقيب</option>
             <option value="رقيب أول">رقيب أول</option>
             <option value="مساعد">مساعد</option>
             <option value="مساعد أول">مساعد أول</option>
             <option value="صانع ماهر">صانع ماهر</option>
             <option value="صانع دقيق">صانع دقيق</option>
             <option value="صانع ممتاز">صانع ممتاز</option>
             <option value="ملاحظ">ملاحظ</option>
             <option value="ملاحظ فني">ملاحظ فني</option>
           </Form.Control>
           {errors.rank && (
             <div className="invalid-feedback">{errors.rank.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="name" className="form-group">
           <Form.Label>اسم ضابط الصف</Form.Label>
           <Form.Control
             type="text"
             placeholder="أدخل اسم ضابط الصف"
             {...register("name")}
             className={`form-control ${errors.name ? "is-invalid" : ""}`}
           />
           {errors.name && (
             <div className="invalid-feedback">{errors.name.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="department" className="form-group">
           <Form.Label>الورشة / الفرع</Form.Label>
           <Form.Control
             as="select"
             {...register("department")}
             className={`form-control ${errors.department ? "is-invalid" : ""}`}
           >
             <option value="">إختر الورشة / الفرع</option>
             {dept.map((dep) => (
               <option key={dep.name} value={dep.name}>
                 {dep.name}
               </option>
             ))}
           </Form.Control>
           {errors.department && (
             <div className="invalid-feedback">{errors.department.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="join_date" className="form-group">
           <Form.Label>تاريخ الضم</Form.Label>
           <Form.Control
             type="date"
             {...register("join_date")}
             className={`form-control ${errors.join_date ? "is-invalid" : ""}`}
           />
           {errors.join_date && (
             <div className="invalid-feedback">{errors.join_date.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="address" className="form-group">
           <Form.Label>العنوان</Form.Label>
           <Form.Control
             type="text"
             placeholder="أدخل العنوان"
             {...register("address")}
             className={`form-control ${errors.address ? "is-invalid" : ""}`}
           />
           {errors.address && (
             <div className="invalid-feedback">{errors.address.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="dob" className="form-group">
           <Form.Label>تاريخ الميلاد</Form.Label>
           <Form.Control
             type="date"
             {...register("dob")}
             className={`form-control ${errors.dob ? "is-invalid" : ""}`}
           />
           {errors.dob && (
             <div className="invalid-feedback">{errors.dob.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="attached" className="form-group">
           <Form.Label>هل ضابط الصف ملحق؟</Form.Label>
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

         {/* Submit Button */}
         <Button
           type="submit"
           variant="primary"
           className="submit-btn"
           disabled={nco.loading}
         >
           {nco.loading ? "جاري الإضافة..." : "إضافة ضابط الصف"}
         </Button>
       </Form>
     </div>
   );
};

export default AddNCOs;
