import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "../../style/style.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import Select from "react-select"; // Importing react-select
import { useSearchParams } from "react-router-dom";

// Validation schema using yup
// Validation schema using yup
const schema = yup.object().shape({
  notes: yup.string().max(500, "الملاحظات يجب ألا تتجاوز 500 حرف").optional(),

  officerID: yup.number().required("اسم الضابط مطلوب"),

  leaveTypeID: yup
    .number()
    .transform((v, o) => (o === "" ? null : v))
    .typeError("سبب الخروج مطلوب")
    .optional(),

  start_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .typeError("يرجى إدخال تاريخ صحيح")
    .optional(),

  end_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .typeError("يرجى إدخال تاريخ صحيح")
    .test(
      "is-after-start",
      "تاريخ العودة يجب أن يكون بعد تاريخ البداية",
      function (value) {
        const start = this.parent.start_date;
        if (!start || !value) return true; // no validation if one is missing
        return value >= start;
      }
    )
    .optional(),

  destination: yup
    .string()
    .max(255, "الوجهة يجب ألا تتجاوز 255 حرف")
    .optional(),
  remaining: yup.string().max(255, "الرصيد يجب ألا يتجاوز 255 حرف").optional(),
  duration: yup.string().max(255, "المدة يجب ألا تتجاوز 255 حرف").optional(),
});

const AddTmam = () => {
  const [officer, setOfficer] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const auth = getAuthUser();
  const [officerLog, setOfficerLog] = useState({
    loading: false,
    err: "",
    notes: "",
    officerID: "",
    leaveTypeID: "",
    start_date: "",
    end_date: "",
    destination: "",
    remaining: "",
    duration: "",
    success: null,
  });
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchParams] = useSearchParams();
  const preselectedMilId = searchParams.get("officer");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const createOfficerLog = async (data) => {
    console.log("Request Data:", data);
    setOfficerLog({ ...officerLog, loading: true });

    const formattedData = {
      ...data,
      start_date: data.start_date
        ? moment(data.start_date).locale("en").format("YYYY-MM-DD")
        : null,
      end_date: data.end_date
        ? moment(data.end_date).locale("en").format("YYYY-MM-DD")
        : null,
    };

    console.log("Formatted Request Data:", formattedData);

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/officerLog/tmam`,
        formattedData,
        {
          headers: { token: auth.token },
        }
      );

      setOfficerLog({
        loading: false,
        err: null,
        success: "تمت الإضافة بنجاح!",
        notes: "",
        officerID: "",
        leaveTypeID: "",
        start_date: "",
        end_date: "",
        destination: "",
        remaining: "",
        duration: "",
      });

      reset(); // Reset form after successful submission

      setTimeout(() => {
        window.history.back();
      }, 1000); // Wait for 1 second before going back
    } catch (err) {
      setOfficerLog({
        ...officerLog,
        loading: false,
        err: err.response
          ? JSON.stringify(err.response.data.errors)
          : "Something went wrong. Please try again later.",
        success: null,
      });
    }
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officer?limit=1000`, {
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

  useEffect(() => {
    if (!preselectedMilId || !officer.data?.length) return;

    const foundOfficer = officer.data.find(
      (o) => String(o.mil_id) === String(preselectedMilId)
    );

    if (foundOfficer) {
      setValue("officerID", foundOfficer.id);

      // لو عايز react-select يبان فيه الاسم
      setSelectedOfficer({
        value: foundOfficer.id,
        label: `${foundOfficer.rank} / ${foundOfficer.name}`,
      });
    }
  }, [preselectedMilId, officer.data]);

  const filteredLeaveTypes = leaveType.filter(
    (type) => ![16, 17, 18].includes(type.id)
  );
  const leaveTypeOptions = filteredLeaveTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));
  // Transform officers into format required by react-select
  const officerOptions = officer.data?.map((officer) => ({
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
      width: "100%",
      padding: "0.375rem 0.75rem",
      borderRadius: "0.25rem",
      border: "1px solid #ced4da",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Make sure the dropdown appears above other elements
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#007bff"
        : state.isFocused
        ? "#f8f9fa"
        : null,
      color: state.isSelected ? "#fff" : "#495057",
    }),
  };

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل تمام جديد</h1>

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
            value={selectedOfficer}
            options={officerOptions}
            onChange={(option) => {
              setSelectedOfficer(option);
              setValue("officerID", option.value);
            }}
            styles={customStyles}
            placeholder="اختر الضابط"
            isDisabled={!!preselectedMilId}

          />

          {errors.officerID && (
            <div className="invalid-feedback">{errors.officerID.message}</div>
          )}
        </Form.Group>

        {/* Leave Type Dropdown */}
        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>سبب الخروج</Form.Label>
          <Select
            options={leaveTypeOptions}
            placeholder="اختر سبب الخروج"
            onChange={(selectedOption) => {
              setValue("leaveTypeID", selectedOption.value);
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

        <Form.Group controlId="destination" className="form-group">
          <Form.Label>إلى</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="أدخل الوجهة"
            {...register("destination")}
            className={`form-control ${errors.destination ? "is-invalid" : ""}`}
          />
          {errors.destination && (
            <div className="invalid-feedback">{errors.destination.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="start_date" className="form-group">
          <Form.Label>الفترة من</Form.Label>
          <Form.Control
            type="date"
            {...register("start_date")}
            className={`form-control ${errors.start_date ? "is-invalid" : ""}`}
          />
          {errors.start_date && (
            <div className="invalid-feedback">{errors.start_date.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="end_date" className="form-group">
          <Form.Label>الفترة إلى</Form.Label>
          <Form.Control
            type="date"
            {...register("end_date")}
            className={`form-control ${errors.end_date ? "is-invalid" : ""}`}
          />
          {errors.end_date && (
            <div className="invalid-feedback">{errors.end_date.message}</div>
          )}
        </Form.Group>

        <Form.Group controlId="duration" className="form-group">
          <Form.Label>المدة</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="أدخل المدة"
            {...register("duration")}
            className={`form-control ${errors.duration ? "is-invalid" : ""}`}
          />
          {errors.duration && (
            <div className="invalid-feedback">{errors.duration.message}</div>
          )}
        </Form.Group>

        {/* Remaining */}

        <Form.Group controlId="remaining" className="form-group">
          <Form.Label>الرصيد</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="أدخل الرصيد"
            {...register("remaining")}
            className={`form-control ${errors.remaining ? "is-invalid" : ""}`}
          />
          {errors.remaining && (
            <div className="invalid-feedback">{errors.remaining.message}</div>
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
          {officerLog.loading ? "جاري الإضافة..." : "تسجيل التمام"}
        </Button>
      </Form>
    </div>
  );
};

export default AddTmam;
