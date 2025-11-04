import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Officers.css';
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
  officerID: yup.number().required(' اسم الضابط مطلوب '),
  leaveTypeID: yup.number().optional('سبب الخروج مطلوب'),
  start_date: yup.date().required('تاريخ البداية مطلوب').typeError('يرجى إدخال تاريخ صحيح'),
  end_date: yup.date().required('تاريخ النهاية مطلوب').min(yup.ref('start_date'), 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية').typeError('يرجى إدخال تاريخ صحيح'),
  destination: yup.string().max(255, 'الوجهة يجب ألا تتجاوز 255 حرف').optional(),
});

const OfficerDeparture = () => {
  const [officer, setOfficer] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const auth = getAuthUser();
  const [officerLog, setOfficerLog] = useState({
    loading: false,
    err: '',
    notes: '',
    officerID: '',
    leaveTypeID: '',
    start_date: '',
    end_date: '',
    destination: '',
    success: null,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
  });


  
  // Handle form submission
  const createOfficerLog = async (data) => {
    console.log("Request Data:", data);
    setOfficerLog({ ...officerLog, loading: true });

    const formattedData = {
      ...data,
      event_type: 'خروج',
      event_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      loggerID: auth.id,
      start_date: moment(data.start_date).format("YYYY-MM-DD"),
      end_date: moment(data.end_date).format("YYYY-MM-DD"),
    };

    console.log("Formatted Request Data:", formattedData);

    try {
      await axios.post('http://localhost:4001/officerLog/departure', formattedData, {
        headers: { token: auth.token },
      });

      setOfficerLog({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        notes: '',
        officerID: '',
        leaveTypeID: '',
        start_date: '',
        end_date: '',
        destination: '',
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setOfficerLog({
        ...officerLog,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
        success: null,
      });
    }
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/officer/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setOfficer(resp.data))
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
  const officerOptions = officer.map((officer) => ({
    value: officer.id,
    label: `${officer.rank} / ${officer.name}`,
  }));

  // Handle when an officer is selected
  const handleOfficerChange = (selectedOption) => {
    if (selectedOption) {
      setValue("officerID", selectedOption.value); // Set the officerID field in react-hook-form
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
      <h1 className="text-center mb-4">تسجيل خروج جديد</h1>

      {/* Display Errors */}
      {officerLog.err && (
        <Alert variant="danger" className="p-2">
          {officerLog.err}
        </Alert>
      )}

      {/* Display Success Message */}
      {officerLog.success && (
        <Alert variant="success" className="p-2">
          {officerLog.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createOfficerLog)} className="form">
        {/* Officer Dropdown with React Select */}
        <Form.Group controlId="officerID" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Select
            {...register("officerID")} // Bind the officerID value from react-hook-form
            options={officerOptions}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value}
            onChange={handleOfficerChange} // Update officerID on selection
            className="react-select" // Avoid using Bootstrap's `form-control` here
            styles={customStyles} // Apply custom styles to fix overlap issues
            placeholder="اختر الضابط"
          />
          {errors.officerID && <div className="invalid-feedback">{errors.officerID.message}</div>}
        </Form.Group>

        {/* Leave Type Dropdown */}
        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>سبب الخروج</Form.Label>
          <Form.Control
            as="select"
            {...register("leaveTypeID")}
            className={`form-control ${errors.leaveTypeID ? 'is-invalid' : ''}`}
          >
            <option value="">إختر سبب الخروج</option>
            {leaveType.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Form.Control>
          {errors.leaveTypeID && <div className="invalid-feedback">{errors.leaveTypeID.message}</div>}
        </Form.Group>

                <Form.Group controlId="destination" className="form-group">
          <Form.Label>إلى</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="أدخل الوجهة"
            {...register("destination")}
            className={`form-control ${errors.destination ? 'is-invalid' : ''}`}
          />
          {errors.destination && <div className="invalid-feedback">{errors.destination.message}</div>}
        </Form.Group>

         <Form.Group controlId="start_date" className="form-group">
                  <Form.Label>الفترة من</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("start_date")}
                    className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                  />
                  {errors.start_date && <div className="invalid-feedback">{errors.start_date.message}</div>}
                </Form.Group>

        <Form.Group controlId="end_date" className="form-group">
                  <Form.Label>الفترة إلى</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("end_date")}
                    className={`form-control ${errors.end_date ? 'is-invalid' : ''}`}
                  />
                  {errors.end_date && <div className="invalid-feedback">{errors.end_date.message}</div>}
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
        <Button type="submit" variant="primary" className='submit-btn' disabled={officerLog.loading}>
          {officerLog.loading ? 'جاري الإضافة...' : 'تسجيل خروج'}
        </Button>
      </Form>
    </div>
  );
};

export default OfficerDeparture;
