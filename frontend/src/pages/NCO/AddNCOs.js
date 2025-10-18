import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './NCO.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import DatePicker from 'react-datepicker';
import "react-datetime/css/react-datetime.css";
import { ar } from 'date-fns/locale';  // Import Arabic locale from date-fns

const AddNCOs = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [nco, setNCO] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    success: null,
  });

  const createNCO = (e) => {
    e.preventDefault();
    setNCO({ ...nco, loading: true });

    const data = {
      mil_id: nco.mil_id,
      rank: nco.rank,
      name: nco.name,
      department: nco.department.toString(),
      join_date: nco.join_date,
    };

    axios
      .post('http://localhost:4001/nco/', data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setNCO({
          loading: false,
          err: null,
          name: '',
          rank: '',
          mil_id: '',
          department: '',
          join_date: new Date(),
          success: 'تمت الإضافة بنجاح!',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // Wait for 1 second before going back
      })
      .catch((err) => {
        setNCO({
          ...nco,
          loading: false,
          err: err.response ? JSON.stringify(err.response.data.errors) : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
  };

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
    <div className="add-officer-form">
      <h1 className="text-center mb-4">إضافة ضابط صف جديد</h1>
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
      <Form onSubmit={createNCO} className="form">
        <Form.Group controlId="mil_id" className="form-group">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            value={nco.mil_id}
            onChange={(e) => setNCO({ ...nco, mil_id: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="rank" className="form-group">
          <Form.Label>الدرجة</Form.Label>
          <Form.Control
            as="select"
            value={nco.rank}
            onChange={(e) => setNCO({ ...nco, rank: e.target.value })}
            className="form-control"
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

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم ضابط الصف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم ضابط الصف"
            value={nco.name}
            onChange={(e) => setNCO({ ...nco, name: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="department" className="form-group">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            value={nco.department}
            onChange={(e) => setNCO({ ...nco, department: e.target.value })}
            className="form-control"
          >
            <option value="">إختر الورشة / الفرع</option>
            {dept.map((dep) => (
              <option key={dep.name} value={dep.name}>
                {dep.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

          <Form.Group controlId="join_date" className="form-group">
  <Form.Label>تاريخ الضم</Form.Label>
  <Form.Control
    type="date"
    placeholder="أدخل تاريخ الضم"
    value={nco.join_date}
    onChange={(e) => setNCO({ ...nco, join_date: e.target.value })}
    className="form-control"
  />
</Form.Group>

        <Button variant="primary" type="submit" className="submit-btn" disabled={nco.loading}>
          {nco.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddNCOs;
