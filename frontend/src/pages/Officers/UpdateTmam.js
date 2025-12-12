import React, { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "./UpdateOfficers.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema using yup
const schema = yup.object().shape({
  leaveTypeID: yup
    .number()
    .transform((v, o) => (o === "" ? null : v))
    .nullable()
    .typeError("سبب الخروج مطلوب"),
  start_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .nullable()
    .typeError("يرجى إدخال تاريخ صحيح"),
  end_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .nullable()
    .typeError("يرجى إدخال تاريخ صحيح")
    .test("is-after-start", "تاريخ العودة يجب أن يكون بعد تاريخ البداية", function (value) {
      const start = this.parent.start_date;
      if (!start || !value) return true;
      return value >= start;
    }),
  destination: yup.string().max(255, "الوجهة يجب ألا تتجاوز 255 حرف").optional(),
});

const UpdateTmam = () => {
  const auth = getAuthUser();
  const { id } = useParams(); // id must be leave_details.id
  const [officer, setOfficer] = useState({ name: "", rank: "" });
  const [leaveType, setLeaveType] = useState([]);
  const [officerLog, setOfficerLog] = useState({
    loading: false,
    err: "",
    success: null,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch both the leaveTypes and the leave record, then reset the form
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setOfficerLog(prev => ({ ...prev, loading: true, err: "", success: null }));

      try {
        // run in parallel
        const [leaveTypesResp, logResp] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/leaveType/`, { headers: { token: auth.token } }),
          axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officerLog/${id}`, { headers: { token: auth.token } }),
        ]);

        if (cancelled) return;

        // normalize leave types array depending on backend shape
        const ltData = Array.isArray(leaveTypesResp.data)
          ? leaveTypesResp.data
          : (leaveTypesResp.data.data || leaveTypesResp.data.leaveType || []);

        setLeaveType(ltData);

        // set officer label info
        const log = logResp.data;
        setOfficer({
          name: log.officerName || "",
          rank: log.officerRank || "",
        });

        // transform dates to input-friendly values if needed
        const prepared = {
          ...log,
          start_date: log.start_date ? formatDateToInput(log.start_date) : "",
          end_date: log.end_date ? formatDateToInput(log.end_date) : "",
          // ensure leaveTypeID is number or empty string so select works
          leaveTypeID: log.leaveTypeID ?? "",
        };

        // reset the form with the fetched record AFTER leaveType options are loaded
        reset(prepared);

        setOfficerLog(prev => ({ ...prev, loading: false }));
      } catch (err) {
        console.error("Fetch error:", err);
        setOfficerLog(prev => ({
          ...prev,
          loading: false,
          err: err.response ? JSON.stringify(err.response.data) : err.message || "Fetch failed",
        }));
      }
    };

    fetchAll();

    return () => { cancelled = true; };
  }, [id, auth.token, reset]);

  // Submit (use async/await so we always handle errors and clear loading)
  const updateTmam = async (data) => {
    setOfficerLog(prev => ({ ...prev, loading: true, err: "", success: null }));
    try {
      // convert empty strings to nulls if backend expects nulls
      const payload = {
        ...data,
        start_date: data.start_date ? formatDateToInput(data.start_date) : null,
        end_date: data.end_date ? formatDateToInput(data.end_date) : null,
        leaveTypeID: (data.leaveTypeID === "" || data.leaveTypeID === null) ? null : Number(data.leaveTypeID),
      };

      console.log("PUT payload:", payload);

      const resp = await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/officerLog/${id}`,
        payload,
        {
          headers: { token: auth.token },
        }
      );

      console.log("PUT response:", resp.data);

      setOfficerLog(prev => ({ ...prev, loading: false, success: "تم تعديل تمام الضابط بنجاح!", err: "" }));

      setTimeout(() => { window.history.back(); }, 800);
    } catch (err) {
      console.error("PUT error:", err);
      setOfficerLog(prev => ({
        ...prev,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data) : (err.message || "حدث خطأ"),
        success: null,
      }));
    }
  };

  return (
    <div className="Update">
      <h1 className="text-center p-2">تعديل تمام الضابط</h1>

      {officerLog.err && <Alert variant="danger" className="p-2">{officerLog.err}</Alert>}
      {officerLog.success && <Alert variant="success" className="p-2">{officerLog.success}</Alert>}

      <Form onSubmit={handleSubmit(updateTmam)}>
        <Form.Group controlId="officerLabel" className="form-group">
          <Form.Label>الضابط</Form.Label>
          <Form.Control
            type="text"
            value={`${officer.rank || ""} / ${officer.name || ""}`}
            disabled
            className="form-control"
            readOnly
          />
        </Form.Group>

        <Form.Group controlId="leaveTypeID" className="form-group">
          <Form.Label>سبب الخروج</Form.Label>
          <Form.Control
            as="select"
            {...register("leaveTypeID")}
            className={`form-control ${errors.leaveTypeID ? "is-invalid" : ""}`}
            // keep uncontrolled; react-hook-form will set value via reset()
          >
            <option value="">إختر سبب الخروج</option>
            {leaveType.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
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
            className={`form-control ${errors.destination ? "is-invalid" : ""}`}
          />
          {errors.destination && <div className="invalid-feedback">{errors.destination.message}</div>}
        </Form.Group>

        <Form.Group controlId="start_date" className="form-group">
          <Form.Label>الفترة من</Form.Label>
          <Form.Control type="date" {...register("start_date")} className={`form-control ${errors.start_date ? "is-invalid" : ""}`} />
          {errors.start_date && <div className="invalid-feedback">{errors.start_date.message}</div>}
        </Form.Group>

        <Form.Group controlId="end_date" className="form-group">
          <Form.Label>الفترة إلى</Form.Label>
          <Form.Control type="date" {...register("end_date")} className={`form-control ${errors.end_date ? "is-invalid" : ""}`} />
          {errors.end_date && <div className="invalid-feedback">{errors.end_date.message}</div>}
        </Form.Group>

        <Form.Group controlId="notes" className="form-group">
          <Form.Label>ملاحظات</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="أدخل ملاحظات" {...register("notes")} className={`form-control ${errors.notes ? "is-invalid" : ""}`} />
          {errors.notes && <div className="invalid-feedback">{errors.notes.message}</div>}
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3" disabled={officerLog.loading}>
          {officerLog.loading ? "جاري التعديل..." : "تعديل الضابط"}
        </Button>
      </Form>
    </div>
  );
};

export default UpdateTmam;
