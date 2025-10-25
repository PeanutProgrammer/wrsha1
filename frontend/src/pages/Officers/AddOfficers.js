import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Officers.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import "react-datetime/css/react-datetime.css";

const AddOfficers = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [officer, setOfficer] = useState({
    loading: false,
    err: '',
    name: '',
    rank: '',
    mil_id: '',
    department: '',
    join_date: '',
    address: '',
    height: '',
    weight: '',
    dob: '',
    seniority_number: '',
    success: null,
  });

  const createOfficer = (e) => {
    e.preventDefault();
    setOfficer({ ...officer, loading: true });

    const data = {
      mil_id: officer.mil_id,
      rank: officer.rank,
      name: officer.name,
      department: officer.department.toString(),
      join_date: officer.join_date,
      address: officer.address,
      height: officer.height,
      weight: officer.weight,
      dob: officer.dob,
      seniority_number: officer.seniority_number
    };

    axios
      .post('http://localhost:4001/Officer/', data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficer({
          loading: false,
          err: null,
          name: '',
          rank: '',
          mil_id: '',
          department: '',
          join_date: new Date(),
          address: '',
          height: '',
          weight: '',
          dob: new Date(),
          seniority_number: '',
          success: 'تمت الإضافة بنجاح!',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // Wait for 1 second before going back
      })
      .catch((err) => {
        setOfficer({
          ...officer,
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
      <h1 className="text-center mb-4">إضافة ضابط جديد</h1>
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
      <Form onSubmit={createOfficer} className="form">
        <Form.Group controlId="mil_id" className="form-group">
          <Form.Label>الرقم العسكري</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم العسكري"
            value={officer.mil_id}
            onChange={(e) => setOfficer({ ...officer, mil_id: e.target.value })}
            className="form-control"
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

        <Form.Group controlId="rank" className="form-group">
          <Form.Label>الرتبة</Form.Label>
          <Form.Control
            as="select"
            value={officer.rank}
            onChange={(e) => setOfficer({ ...officer, rank: e.target.value })}
            className="form-control"
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

        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم الضابط</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم الضابط"
            value={officer.name}
            onChange={(e) => setOfficer({ ...officer, name: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="department" className="form-group">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            value={officer.department}
            onChange={(e) => setOfficer({ ...officer, department: e.target.value })}
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
    value={officer.join_date}
    onChange={(e) => setOfficer({ ...officer, join_date: e.target.value })}
    className="form-control"
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


 

        <Button variant="primary" type="submit" className="submit-btn" disabled={officer.loading}>
          {officer.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddOfficers;
