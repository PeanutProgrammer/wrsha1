import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Soldier.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const UpdateSoldiers = () => {
  const auth = getAuthUser();
  let { id } = useParams();

  const [dept, setDept] = useState([]);
  const [soldier, setSoldier] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',  // store as string "YYYY-MM-DD"
    end_date: '',
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

  const UpdateSoldiers = (e) => {
    e.preventDefault();
    setSoldier({ ...soldier, loading: true });

    const data = {
      mil_id: String(soldier.mil_id),
      rank: String(soldier.rank),
      name: String(soldier.name),
      department: String(soldier.department),
      join_date: soldier.join_date,  // already YYYY-MM-DD string
      end_date: soldier.end_date
    };

    axios
      .put('http://localhost:4001/soldier/' + id, data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldier({
          ...soldier,
          loading: false,
          success: 'تم تعديل بيانات الجندي بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setSoldier({
          ...soldier,
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
      .get('http://localhost:4001/soldier/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldier({
          ...soldier,
          mil_id: resp.data._mil_id,
          rank: resp.data._rank,
          name: resp.data._name,
          department: resp.data._department,
          // Just store join_date as received (string), or format to YYYY-MM-DD
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          end_date: resp.data._end_date ? formatDateToInput(resp.data._end_date) : '',
          
        });
      })
      .catch((err) => {
        setSoldier({
          ...soldier,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldier.reload]);

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

      <h1 className="text-center p-2">تعديل بيانات الجندي</h1>

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
      <Form onSubmit={UpdateSoldiers}>
        <Form.Group controlId="mil_id">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الرقم العسكري"
            value={soldier.mil_id}
            onChange={(e) => setSoldier({ ...soldier, mil_id: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="rank">
          <Form.Label>درجة الجندي</Form.Label>
          <Form.Control
            as="select"
            placeholder="إختر درجة الجندي"
            value={soldier.rank}
            onChange={(e) => setSoldier({ ...soldier, rank: e.target.value })}
          >
            <option value="">إختر درجة الجندي</option>
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
          <Form.Label>إسم الجندي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم الجندي"
            value={soldier.name}
            onChange={(e) => setSoldier({ ...soldier, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="department">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            placeholder="أدخل الورشة / الفرع"
            value={soldier.department}
            onChange={(e) => setSoldier({ ...soldier, department: e.target.value })}
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
            value={soldier.join_date}
            onChange={(e) => setSoldier({ ...soldier, join_date: e.target.value })}
          />
        </Form.Group>


        <Form.Group controlId="join_date">
          <Form.Label>تاريخ التسريح</Form.Label>
          <Form.Control
            type="date"
            value={soldier.end_date}
            onChange={(e) => setSoldier({ ...soldier, end_date: e.target.value })}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          تعديل الجندي
        </Button>
      </Form>
    </div>
  );
};

export default UpdateSoldiers;
