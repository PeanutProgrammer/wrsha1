import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './UpdateOfficers.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const UpdateOfficers = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [dept, setDept] = useState([]);
  const [officer, setOfficer] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',  // store as string "YYYY-MM-DD"
    address: '',
    height: '',
    weight: '',
    dob: '',
    seniority_number: '',
    success: null,
    reload: false,
  });

  // Helper to format date as YYYY-MM-DD (local, no timezone offset)
  const formatDateToInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateOfficers = (e) => {
    e.preventDefault();
    setOfficer({ ...officer, loading: true });

    const data = {
      mil_id: String(officer.mil_id),
      rank: String(officer.rank),
      name: String(officer.name),
      department: String(officer.department),
      join_date: officer.join_date,  // already YYYY-MM-DD string
      address: officer.address,
      height: officer.height,
      weight: officer.weight,
      dob: officer.dob,
      seniority_number: officer.seniority_number
    };

    axios
      .put('http://localhost:4001/Officer/' + id, data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficer({
          ...officer,
          loading: false,
          success: 'تم تعديل بيانات الضابط بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setOfficer({
          ...officer,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
        console.log(err);
      });
  };

  useEffect(() => {
    axios
      .get('http://localhost:4001/Officer/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficer({
          ...officer,
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          // Just store join_date as received (string), or format to YYYY-MM-DD
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          address: resp.data._address,
          height: resp.data._height,
          weight: resp.data._weight,
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
          seniority_number: resp.data._seniority_number
        });
      })
      .catch((err) => {
        setOfficer({
          ...officer,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer.reload]);

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

  return (
    <div className="Update">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/react-datepicker/dist/react-datepicker.css"
      />

      <h1 className="text-center p-2">تعديل بيانات الضابط</h1>

      {officer.err && (
        <Alert variant="danger" className="p-2">
          {officer.err}
        </Alert>
      )}
      {officer.success && (
        <Alert variant="success" className="p-2">
          {officer.success}
        </Alert>
      )}
      <Form onSubmit={updateOfficers}>
        <Form.Group controlId="mil_id">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            value={officer.mil_id}
            onChange={(e) => setOfficer({ ...officer, mil_id: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="seniority_number" className="form-group">
          <Form.Label>رقم الأقدمية</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم الأقدمية "
            value={officer.seniority_number}
            onChange={(e) => setOfficer({ ...officer, seniority_number: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="rank">
          <Form.Label>رتبة الضابط</Form.Label>
          <Form.Control
            as="select"
            placeholder="إختر رتبة الضابط"
            value={officer.rank}
            onChange={(e) => setOfficer({ ...officer, rank: e.target.value })}
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
        </Form.Group>
        <Form.Group controlId="name">
          <Form.Label>إسم الضابط</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم الضابط"
            value={officer.name}
            onChange={(e) => setOfficer({ ...officer, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="department">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            placeholder="أدخل الورشة / الفرع"
            value={officer.department}
            onChange={(e) => setOfficer({ ...officer, department: e.target.value })}
          >
            <option value="">إختر الورشة / الفرع</option>
            {dept.map((dep) => (
              <option key={dep.name} value={dep.name}>
                {dep.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="join_date">
          <Form.Label>تاريخ الضم</Form.Label>
          <Form.Control
            type="date"
            value={officer.join_date}
            onChange={(e) => setOfficer({ ...officer, join_date: e.target.value })}
          />
        </Form.Group>

         <Form.Group controlId="address" className="form-group">
                  <Form.Label>العنوان</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="أدخل العنوان"
                    value={officer.address}
                    onChange={(e) => setOfficer({ ...officer, address: e.target.value })}
                    className="form-control"
                  />
                </Form.Group>


<Form.Group controlId="height" className="form-group">
          <Form.Label>الطول</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الطول"
            value={officer.height}
            onChange={(e) => setOfficer({ ...officer, height: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        
 <Form.Group controlId="weight" className="form-group">
          <Form.Label>الوزن</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الوزن"
            value={officer.weight}
            onChange={(e) => setOfficer({ ...officer, weight: e.target.value })}
            className="form-control"
          />
        </Form.Group>

                  <Form.Group controlId="dob" className="form-group">
  <Form.Label>تاريخ الميلاد</Form.Label>
  <Form.Control
    type="date"
    placeholder="أدخل تاريخ الميلاد"
    value={officer.dob}
    onChange={(e) => setOfficer({ ...officer, dob: e.target.value })}
    className="form-control"
  />
</Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          تعديل الضابط
        </Button>
      </Form>
    </div>
  );
};

export default UpdateOfficers;
