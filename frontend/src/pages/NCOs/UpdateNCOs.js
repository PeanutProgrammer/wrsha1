import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './NCO.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const UpdateNCOs = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [dept, setDept] = useState([]);
  const [nco, setNCO] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',  // store as string "YYYY-MM-DD"
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

  const updateNCOs = (e) => {
    e.preventDefault();
    setNCO({ ...nco, loading: true });

    const data = {
      mil_id: String(nco.mil_id),
      rank: String(nco.rank),
      name: String(nco.name),
      department: String(nco.department),
      join_date: nco.join_date,  // already YYYY-MM-DD string
    };

    axios
      .put('http://localhost:4001/nco/' + id, data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setNCO({
          ...nco,
          loading: false,
          success: 'تم تعديل بيانات الضابط بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setNCO({
          ...nco,
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
      .get('http://localhost:4001/nco/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setNCO({
          ...nco,
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          // Just store join_date as received (string), or format to YYYY-MM-DD
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
        });
      })
      .catch((err) => {
        setNCO({
          ...nco,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nco.reload]);

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

      {nco.err && (
        <Alert variant="danger" className="p-2">
          {nco.err}
        </Alert>
      )}
      {nco.success && (
        <Alert variant="success" className="p-2">
          {nco.success}
        </Alert>
      )}
      <Form onSubmit={updateNCOs}>
        <Form.Group controlId="mil_id">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الرقم العسكري"
            value={nco.mil_id}
            onChange={(e) => setNCO({ ...nco, mil_id: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="rank">
          <Form.Label>درجة ضابط الصف</Form.Label>
          <Form.Control
            as="select"
            placeholder="إختر درجة ضابط الصف"
            value={nco.rank}
            onChange={(e) => setNCO({ ...nco, rank: e.target.value })}
          >
            <option value="">إختر درجة ضابط الصف</option>
            <option value="عريف">عريف</option>
            <option value="رقيب">رقيب</option>
            <option value="رقيب أول">رقيب أول</option> 
            <option value="مساعد">مساعد</option> 
            <option value="مساعد أول">مساعد أول</option> 
            <option value="صانع ماهر">صانع ماهر</option> 
            <option value="صانع دقيق">صانع دقيق</option> 
            <option value="ملاحظ">ملاحظ</option> 
            <option value="ملاحظ فني">ملاحظ فني</option> 
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="name">
          <Form.Label>إسم ضابط الصف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم ضابط الصف"
            value={nco.name}
            onChange={(e) => setNCO({ ...nco, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="department">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            placeholder="أدخل الورشة / الفرع"
            value={nco.department}
            onChange={(e) => setNCO({ ...nco, department: e.target.value })}
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
            value={nco.join_date}
            onChange={(e) => setNCO({ ...nco, join_date: e.target.value })}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          تعديل الضابط
        </Button>
      </Form>
    </div>
  );
};

export default UpdateNCOs;
