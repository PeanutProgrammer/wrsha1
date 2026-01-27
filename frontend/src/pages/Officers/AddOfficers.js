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
  name: yup.string().min(3, 'اسم الضابط يجب أن يكون أكثر من 3 حروف').max(50, 'اسم الضابط يجب ألا يتجاوز 50 حرف').required('اسم الضابط مطلوب'),
  rank: yup.string().required('الرتبة مطلوبة'),
  mil_id: yup.string().matches(/^\d+$/, 'الرقم العسكري يجب أن يحتوي على أرقام فقط').required('الرقم العسكري مطلوب'),
  department: yup.string().required('الفرع / الورشة مطلوب'),
  join_date: yup.date().required('تاريخ الضم مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  address: yup.string().required('العنوان مطلوب'),
  height: yup.number().typeError('الطول يجب أن يكون رقماً').required('الطول مطلوب'),
  weight: yup.number().typeError('الوزن يجب أن يكون رقماً').required('الوزن مطلوب'),
  dob: yup.date().required('تاريخ الميلاد مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  seniority_number: yup.string().required('رقم الأقدمية مطلوب'),
  attached: yup.boolean().required(),
});

const AddOfficers = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [officer, setOfficer] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    address: '',
    height: '',
    weight: '',
    dob: '',
    seniority_number: '',
      attached: false,
    success: null,
  });

   const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  console.log("Form errors:", errors); // Log to see any validation issues



  const formatDateToLocalString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');  // months are 0-indexed
  const day = String(d.getDate()).padStart(2, '0');  // pad day with zero if needed
  return `${year}-${month}-${day}`;
};

   // Handle form submission
  const createOfficer = async (data) => {
          console.log("Request Data:", data);

    setOfficer({ ...officer, loading: true });

      console.log("Request Data:", data);

  // Format the dates (join_date and dob) to YYYY/MM/DD format
  const formattedData = {
    ...data,
    join_date: data.join_date ? formatDateToLocalString(data.join_date) : "",
    dob: data.dob ? formatDateToLocalString(data.dob) : "",
    attached: data.attached === true ? true : false, // default to false if unchecked
  };

  // Log the formatted data
  console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/Officer/`, formattedData, {
        headers: { token: auth.token },
      });

      setOfficer({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        name: '',
        rank: '',
        mil_id: '',
        department: '',
        join_date: '',
        address: '',
        height: '',
        weight: '',
        dob: '',
        seniority_number: '',
        attached: false,
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setOfficer({
        ...officer,
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
       <h1 className="text-center mb-4">إضافة ضابط جديد</h1>

       {/* Display Errors */}
       {officer.err && (
         <Alert variant="danger" className="p-2">
           {officer.err}
         </Alert>
       )}

       {/* Display Success Message */}
       {officer.success && (
         <Alert variant="success" className="p-2">
           {officer.success}
         </Alert>
       )}

       <Form onSubmit={handleSubmit(createOfficer)} className="form">
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

         <Form.Group controlId="seniority_number" className="form-group">
           <Form.Label>رقم الأقدمية</Form.Label>
           <Form.Control
             type="text"
             placeholder="أدخل رقم الأقدمية"
             {...register("seniority_number")}
             className={`form-control ${
               errors.seniority_number ? "is-invalid" : ""
             }`}
           />
           {errors.seniority_number && (
             <div className="invalid-feedback">
               {errors.seniority_number.message}
             </div>
           )}
         </Form.Group>

         <Form.Group controlId="rank" className="form-group">
           <Form.Label>الرتبة</Form.Label>
           <Form.Control
             as="select"
             {...register("rank")}
             className={`form-control ${errors.rank ? "is-invalid" : ""}`}
           >
             <option value="">إختر رتبة الضابط</option>
             <option value="ملازم">ملازم</option>
             <option value="ملازم أول">ملازم أول</option>
             <option value="نقيب">نقيب</option>
             <option value="نقيب أ ح">نقيب أ ح</option>
             <option value="رائد">رائد</option>
             <option value="رائد أ ح">رائد أ ح</option>
             <option value="مقدم">مقدم</option>
             <option value="مقدم أ ح">مقدم أ ح</option>
             <option value="عقيد">عقيد</option>
             <option value="عقيد أ ح">عقيد أ ح</option>
             <option value="عميد">عميد</option>
             <option value="عميد أ ح">عميد أ ح</option>
             <option value="لواء">لواء</option>
             <option value="لواء أ ح">لواء أ ح</option>
             <option value="فريق">فريق</option>
             <option value="فريق أول">فريق أول</option>
             <option value="مشير">مشير</option>
           </Form.Control>
           {errors.rank && (
             <div className="invalid-feedback">{errors.rank.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="name" className="form-group">
           <Form.Label>اسم الضابط</Form.Label>
           <Form.Control
             type="text"
             placeholder="أدخل اسم الضابط"
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

         <Form.Group controlId="height" className="form-group">
           <Form.Label>الطول</Form.Label>
           <Form.Control
             type="number"
             placeholder="أدخل الطول"
             {...register("height")}
             className={`form-control ${errors.height ? "is-invalid" : ""}`}
           />
           {errors.height && (
             <div className="invalid-feedback">{errors.height.message}</div>
           )}
         </Form.Group>

         <Form.Group controlId="weight" className="form-group">
           <Form.Label>الوزن</Form.Label>
           <Form.Control
             type="number"
             placeholder="أدخل الوزن"
             {...register("weight")}
             className={`form-control ${errors.weight ? "is-invalid" : ""}`}
           />
           {errors.weight && (
             <div className="invalid-feedback">{errors.weight.message}</div>
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
           <Form.Label>هل الضابط ملحق؟</Form.Label>
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
           disabled={officer.loading}
         >
           {officer.loading ? "جاري الإضافة..." : "إضافة الضابط"}
         </Button>
       </Form>
     </div>
   );
};

export default AddOfficers;
