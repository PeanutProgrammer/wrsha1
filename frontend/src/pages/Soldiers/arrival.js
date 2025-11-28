import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "./Soldier.css";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import Select from "react-select";

// Validation schema using yup
const schema = yup.object().shape({
  notes: yup.string().max(500, "الملاحظات يجب ألا تتجاوز 500 حرف").optional(),
  soldierID: yup.number().required("اسم ضابط الصف مطلوب"),
  leaveTypeID: yup.number().optional().nullable(),
});

const SoldierArrival = () => {
  const [soldier, setSoldier] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const auth = getAuthUser();

  const [soldierLog, setSoldierLog] = useState({
    loading: false,
    err: "",
    notes: "",
    soldierID: "",
    leaveTypeID: "",
    success: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Fetch soldiers
  useEffect(() => {
    axios
      .get("http://localhost:4001/soldier/absent", {
        headers: { token: auth.token },
      })
      .then((resp) => setSoldier(resp.data))
      .catch((err) => console.log(err));
  }, []);

  // Fetch leave types
  useEffect(() => {
    axios
      .get("http://localhost:4001/leaveType/", {
        headers: { token: auth.token },
      })
      .then((resp) => setLeaveType(resp.data))
      .catch((err) => console.log(err));
  }, []);

  // Convert soldiers into react-select format
  const soldierOptions = soldier.map((s) => ({
    value: s.id,
    label: `${s.rank} / ${s.name}`,
    leaveTypeID: s.leaveTypeID, // Attach latest leave type
  }));

  // When soldier is selected
  const handleSoldierChange = (selectedOption) => {
    setValue("soldierID", selectedOption.value, { shouldValidate: true });
    setValue("leaveTypeID", selectedOption.leaveTypeID || "", {
      shouldValidate: true,
    });
  };

  // Submit
  const createSoldierLog = async (data) => {
    setSoldierLog({ ...soldierLog, loading: true });

    const formattedData = {
      ...data,
      event_type: "دخول",
      event_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      loggerID: auth.id,
      start_date: moment().format("YYYY-MM-DD"),
      end_date: null,
    };

    try {
      await axios.post("http://localhost:4001/soldierLog/", formattedData, {
        headers: { token: auth.token },
      });

      setSoldierLog({
        loading: false,
        err: null,
        success: "تمت الإضافة بنجاح!",
        notes: "",
        soldierID: "",
        leaveTypeID: "",
      });

      reset();

      setTimeout(() => {
        window.history.back();
      }, 1000);
    } catch (err) {
      setSoldierLog({
        ...soldierLog,
        loading: false,
        err: err.response
          ? JSON.stringify(err.response.data.errors)
          : "حدث خطأ، حاول مرة أخرى.",
        success: null,
      });
    }
  };

  // react-select styles
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
      zIndex: 1050,
    }),
  };

  return (
    <div className="add-officer-form">
      <h1 className="text-center mb-4">تسجيل دخول جديد</h1>

      {/* Errors */}
      {soldierLog.err && (
        <Alert variant="danger" className="p-2">
          {soldierLog.err}
        </Alert>
      )}

      {/* Success */}
      {soldierLog.success && (
        <Alert variant="success" className="p-2">
          {soldierLog.success}
        </Alert>
      )}

      <Form onSubmit={handleSubmit(createSoldierLog)} className="form">
        {/* Soldier Select */}
        <Form.Group controlId="soldierID" className="form-group">
          <Form.Label>الاسم</Form.Label>
          <Select
            options={soldierOptions}
            onChange={handleSoldierChange}
            styles={customStyles}
            placeholder="اختر الجندي"
          />
          {errors.soldierID && (
            <div className="invalid-feedback d-block">
              {errors.soldierID.message}
            </div>
          )}
        </Form.Group>

        {/* Leave Type */}
        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>نوع العودة</Form.Label>
          <Form.Control
            as="select"
            {...register("leaveTypeID")}
            className={errors.leaveTypeID ? "is-invalid" : ""}
          >
            <option value="">إختر نوع العودة</option>
            {leaveType.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Form.Control>
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
            {...register("notes")}
            placeholder="أدخل ملاحظات"
            className={errors.notes ? "is-invalid" : ""}
          />
          {errors.notes && (
            <div className="invalid-feedback">{errors.notes.message}</div>
          )}
        </Form.Group>

        <Button type="submit" variant="primary" disabled={soldierLog.loading}>
          {soldierLog.loading ? "جاري الإضافة..." : "تسجيل دخول"}
        </Button>
      </Form>
    </div>
  );
};

export default SoldierArrival;
