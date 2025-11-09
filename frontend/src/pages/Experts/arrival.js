import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Expert.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import Select from 'react-select'; // Importing react-select

// Validation schema using yup
const schema = yup.object().shape({
  notes: yup.string().max(500, 'الملاحظات يجب ألا تتجاوز 500 حرف').optional(),
  expertID: yup.number().required(' اسم الخبير مطلوب '),
  department_visited: yup.string().required('الورشة / الفرع مطلوب'),
});

const ExpertArrival = () => {
  const [expert, setExpert] = useState([]);
  const [dept, setDept] = useState([]);
  const auth = getAuthUser();
  const [expertLog, setExpertLog] = useState({
    loading: false,
    err: '',
    notes: '',
    expertID: '',
    department_visited: '',
    success: null,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const createExpertLog = async (data) => {
    console.log("Request Data:", data);
    setExpertLog({ ...expertLog, loading: true });

    const formattedData = {
      ...data,
      start_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      end_date: null,
      loggerID: auth.id
    };

        console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post('http://localhost:4001/expertLog/', formattedData, {
        headers: { token: auth.token },
      });

      setExpertLog({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        notes: '',
        expertID: '',
        department_visited: '',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setExpertLog({
        ...expertLog,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
        success: null,
      });
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/expert/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setExpert(resp.data))
      .catch((err) => console.log(err));
  }, []);

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

  // Transform experts into format required by react-select
  const expertOptions = expert.map((expert) => ({
    value: expert.nationalID,
    label: `${expert.name}`,
  }));

  // Handle when an expert is selected
  const handleExpertChange = (selectedOption) => {
    if (selectedOption) {
      setValue("expertID", selectedOption.value); // Set the expertID field in react-hook-form
    }
  };

  // Custom styles for react-select to prevent conflict with Bootstrap's form-control
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: '100%',
      padding: '0.375rem 0.75rem',
      borderRadius: '0.25rem',
      border: '1px solid #ced4da',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Make sure the dropdown appears above other elements
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : null,
      color: state.isSelected ? '#fff' : '#495057',
    }),
  };



  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل دخول جديد</h1>

      {/* Display Errors */}
      {expertLog.err && (
        <Alert variant="danger" className="p-2">
          {expertLog.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {expertLog.success && (
        <Alert variant="success" className="p-2">
          {expertLog.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createExpertLog)} className="form">
        {/* Officer Dropdown with React Select */}
        <Form.Group controlId="expertID" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Select
            {...register("expertID")} // Bind the expertID value from react-hook-form
            options={expertOptions}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value}
            onChange={handleExpertChange} // Update expertID on selection
            className="react-select" // Avoid using Bootstrap's `form-control` here
            styles={customStyles} // Apply custom styles to fix overlap issues
            placeholder="اختر الخبير"
          />
          {errors.expertID && <div className="invalid-feedback">{errors.expertID.message}</div>}
        </Form.Group>

        {/* Leave Type Dropdown */}
        <Form.Group controlId="department_visited" className="form-group">
          <Form.Label>الورشة / الفرع المطلوب</Form.Label>
          <Form.Control
            as="select"
            {...register("department_visited")}
            className={`form-control ${errors.department_visited ? 'is-invalid' : ''}`}
          >
            <option value="">إختر الورشة / الفرع المطلوب</option>
            {dept.map((type) => (
              <option key={type.name} value={type.name}>{type.name}</option>
            ))}
          </Form.Control>
          {errors.department_visited && <div className="invalid-feedback">{errors.department_visited.message}</div>}
        </Form.Group>

        {/* Notes */}
        <Form.Group controlId="notes" className="form-group">
          <Form.Label>ملاحظات</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="أدخل ملاحظات"
            {...register("notes")}
            className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
          />
          {errors.notes && <div className="invalid-feedback">{errors.notes.message}</div>}
        </Form.Group>

        {/* Submit Button */}
        <Button type="submit" variant="primary" className='submit-btn' disabled={expertLog.loading}>
          {expertLog.loading ? 'جاري الإضافة...' : 'تسجيل دخول'}
        </Button>
      </Form>
    </div>
  );
};

export default ExpertArrival;
