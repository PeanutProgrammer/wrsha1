import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import "../../style/style.css";
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
  ncoID: yup.number().required(' اسم ضابط الصف مطلوب '),
  leaveTypeID: yup.number().required('نوع العودة مطلوب'),
});

const NCOArrival = () => {
  const [officer, setOfficer] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const auth = getAuthUser();
  const [officerLog, setOfficerLog] = useState({
    loading: false,
    err: '',
    notes: '',
    ncoID: '',
    leaveTypeID: '',
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
      event_type: 'دخول',
      event_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      loggerID: auth.id,
            start_date: moment(data.start_date).format("YYYY-MM-DD"),
            end_date: null
    };

        console.log("Formatted Request Data:", formattedData);


    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/ncoLog/`, formattedData, {
        headers: { token: auth.token },
      });

      setOfficerLog({
        loading: false,
        err: null,
        success: 'تمت الإضافة بنجاح!',
        notes: '',
        ncoID: '',
        leaveTypeID: '',
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
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/nco/absent`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setOfficer(resp.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/leaveType/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => setLeaveType(resp.data))
      .catch((err) => console.log(err));
  }, []);

  const filteredLeaveTypes = leaveType.filter(
    (type) => ![16, 17, 18].includes(type.id)
  );

  const leaveTypeOptions = filteredLeaveTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));
  // Transform officers into format required by react-select
  const officerOptions = officer.map((officer) => ({
    value: officer.id,
    label: `${officer.rank} / ${officer.name}`,
    leaveTypeID: officer.leaveTypeID, // Attach latest leave type
  }));

  // Handle when an officer is selected
  const handleOfficerChange = (selectedOption) => {
    if (selectedOption) {
      setValue("ncoID", selectedOption.value); // Set the ncoID field in react-hook-form
      setValue("leaveTypeID", selectedOption.leaveTypeID); // Set the leaveTypeID field based on selected officer

      // NEW: Auto-select UI of leaveType
      const found = leaveTypeOptions.find(
        (opt) => opt.value === selectedOption.leaveTypeID
      );
      setSelectedLeaveType(found || null);
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
      fontWeight: state.isSelected ? '600' : '500',
    }),
  };

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل دخول جديد</h1>

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
        <Form.Group controlId="ncoID" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Select
            {...register("ncoID")} // Bind the ncoID value from react-hook-form
            options={officerOptions}
            getOptionLabel={(e) => e.label}
            getOptionValue={(e) => e.value}
            onChange={handleOfficerChange} // Update ncoID on selection
            className="react-select" // Avoid using Bootstrap's `form-control` here
            styles={customStyles} // Apply custom styles to fix overlap issues
            placeholder="اختر ضابط الصف"
          />
          {errors.ncoID && (
            <div className="invalid-feedback">{errors.ncoID.message}</div>
          )}
        </Form.Group>

        {/* Leave Type Dropdown */}
        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>نوع العودة</Form.Label>
          <Select
            options={leaveTypeOptions}
            placeholder="اختر نوع العودة"
            value={selectedLeaveType} // AUTO SELECTED
            onChange={(selectedOption) => {
              setSelectedLeaveType(selectedOption); // Update UI
              setValue("leaveTypeID", selectedOption.value); // Update form
            }}
            styles={customStyles}
            className="react-select"
          />
          {errors.leaveTypeID && (
            <div className="invalid-feedback d-block">
              {errors.leaveTypeID.message}
            </div>
          )}
          {errors.leaveTypeID && (
            <div className="invalid-feedback">{errors.leaveTypeID.message}</div>
          )}
        </Form.Group>

        {/* Notes */}
        <Form.Group controlId="notes" className="form-group">
          <Form.Label>ملاحظات</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="أدخل ملاحظات"
            {...register("notes")}
            className={`form-control ${errors.notes ? "is-invalid" : ""}`}
          />
          {errors.notes && (
            <div className="invalid-feedback">{errors.notes.message}</div>
          )}
        </Form.Group>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="submit-btn"
          disabled={officerLog.loading}
        >
          {officerLog.loading ? "جاري الإضافة..." : "تسجيل دخول"}
        </Button>
      </Form>
    </div>
  );
};

export default NCOArrival;
