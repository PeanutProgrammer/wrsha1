import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Soldier.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import DatePicker from 'react-datepicker';
import "react-datetime/css/react-datetime.css";
import { ar } from 'date-fns/locale';  // Import Arabic locale from date-fns

const AddSoldiers = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [soldier, setSoldier] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    end_date: '',
    success: null,
  });

  const createSoldier = (e) => {
    e.preventDefault();
    setSoldier({ ...soldier, loading: true });

    const data = {
      mil_id: soldier.mil_id,
      rank: soldier.rank,
      name: soldier.name,
      department: soldier.department.toString(),
      join_date: soldier.join_date,
      end_date: soldier.end_date
    };

    axios
      .post('http://localhost:4001/soldier/', data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldier({
          loading: false,
          err: null,
          name: '',
          rank: '',
          mil_id: '',
          department: '',
          join_date: new Date(),
          end_date: new Date(),
          success: 'تمت الإضافة بنجاح!',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // Wait for 1 second before going back
      })
      .catch((err) => {
        setSoldier({
          ...soldier,
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
      <h1 className="text-center mb-4">إضافة جندي جديد</h1>
      {soldier.err && (
        <Alert variant="danger" className="p-2">
          {soldier.err}
        </Alert>
      )}
      {soldier.success && (
        <Alert variant="success" className="p-2">
          {soldier.success}
        </Alert>
      )}
      <Form onSubmit={createSoldier} className="form">
        <Form.Group controlId="mil_id" className="form-group">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            value={soldier.mil_id}
            onChange={(e) => setSoldier({ ...soldier, mil_id: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="rank" className="form-group">
          <Form.Label>الدرجة</Form.Label>
          <Form.Control
            as="select"
            value={soldier.rank}
            onChange={(e) => setSoldier({ ...soldier, rank: e.target.value })}
            className="form-control"
          >
            <option value="">إختر درجة الجندي </option>
            <option value="جندي">جندي</option>
            <option value="عريف مجند">عريف مجند</option>

          </Form.Control>
        </Form.Group>

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم الجندي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الجندي"
            value={soldier.name}
            onChange={(e) => setSoldier({ ...soldier, name: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="department" className="form-group">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            value={soldier.department}
            onChange={(e) => setSoldier({ ...soldier, department: e.target.value })}
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
    value={soldier.join_date}
    onChange={(e) => setSoldier({ ...soldier, join_date: e.target.value })}
    className="form-control"
  />
</Form.Group>

<Form.Group controlId="end_date" className="form-group">
  <Form.Label>تاريخ التسريح</Form.Label>
  <Form.Control
    type="date"
    placeholder="أدخل تاريخ التسريح"
    value={soldier.end_date}
    onChange={(e) => setSoldier({ ...soldier, end_date: e.target.value })}
    className="form-control"
  />
</Form.Group>

        <Button variant="primary" type="submit" className="submit-btn" disabled={soldier.loading}>
          {soldier.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddSoldiers;
