import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Soldier.css';
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
  soldierID: yup.number().required(' اسم ضابط الصف مطلوب '),
  leaveTypeID: yup.number().optional('نوع العودة مطلوب'),
});

const SoldierArrival = () => {
  const [soldier, setSoldier] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const auth = getAuthUser();
  const [soldierLog, setSoldierLog] = useState({
    loading: false,
    err: '',
    notes: '',
    soldierID: '',
    leaveTypeID: '',
    success: null,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const createSoldierLog = async (data) => {
    console.log("Request Data:", data);
    setSoldierLog({ ...soldierLog, loading: true });

    const formattedData = {
      ...data,
      event_type: 'دخول',
      event_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      loggerID: auth.id
    };

        console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post('http://localhost:4001/soldierLog/', formattedData, {
        headers: { token: auth.token },
      });

      setSoldierLog({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        notes: '',
        soldierID: '',
        leaveTypeID: '',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setSoldierLog({
        ...soldierLog,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
        success: null,
      });
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/soldier/absent', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setSoldier(resp.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:4001/leaveType/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setLeaveType(resp.data))
      .catch((err) => console.log(err));
  }, []);

  // Transform officers into format required by react-select
  const soldierOptions = soldier.map((soldier) => ({
    value: soldier.id,
    label: `${soldier.rank} / ${soldier.name}`,
  }));

  // Handle when an soldier is selected
  const handleOfficerChange = (selectedOption) => {
    if (selectedOption) {
      setValue("soldierID", selectedOption.value); // Set the soldierID field in react-hook-form
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
      {soldierLog.err && (
        <Alert variant="danger" className="p-2">
          {soldierLog.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {soldierLog.success && (
        <Alert variant="success" className="p-2">
          {soldierLog.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createSoldierLog)} className="form">
        {/* Officer Dropdown with React Select */}
        <Form.Group controlId="soldierID" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Select
            {...register("soldierID")} // Bind the soldierID value from react-hook-form
            options={soldierOptions}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value}
            onChange={handleOfficerChange} // Update soldierID on selection
            className="react-select" // Avoid using Bootstrap's `form-control` here
            styles={customStyles} // Apply custom styles to fix overlap issues
            placeholder="اختر الجندي "
          />
          {errors.soldierID && <div className="invalid-feedback">{errors.soldierID.message}</div>}
        </Form.Group>

        {/* Leave Type Dropdown */}
        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>نوع العودة</Form.Label>
          <Form.Control
            as="select"
            {...register("leaveTypeID")}
            className={`form-control ${errors.leaveTypeID ? 'is-invalid' : ''}`}
          >
            <option value="">إختر نوع العودة</option>
            {leaveType.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Form.Control>
          {errors.leaveTypeID && <div className="invalid-feedback">{errors.leaveTypeID.message}</div>}
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
        <Button type="submit" variant="primary" className='submit-btn' disabled={soldierLog.loading}>
          {soldierLog.loading ? 'جاري الإضافة...' : 'تسجيل دخول'}
        </Button>
      </Form>
    </div>
  );
};

export default SoldierArrival;
