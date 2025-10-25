import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Civillian.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import DatePicker from 'react-datepicker';
import "react-datetime/css/react-datetime.css";
import { ar } from 'date-fns/locale';  // Import Arabic locale from date-fns

const AddCivillians = () => {
  const auth = getAuthUser();
  const [dept, setDept] = useState([]);
  const [civillian, setCivillian] = useState({
    loading: false,
    err: '',
    name: '',
    dob: '',
    nationalID: '',
    department: '',
    join_date: '',
    address: '',
    telephone_number: '',
    success: null,
  });

  const createCivillian = (e) => {
    e.preventDefault();
    setCivillian({ ...civillian, loading: true });

    const data = {
      nationalID: civillian.nationalID,
      dob: civillian.dob,
      name: civillian.name,
      department: civillian.department.toString(),
      join_date: civillian.join_date,
      address: civillian.address,
      telephone_number: civillian.telephone_number
    };

    axios
      .post('http://localhost:4001/civillian/', data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillian({
          loading: false,
          err: null,
          name: '',
          dob: new Date(),
          nationalID: '',
          department: '',
          join_date: new Date(),
          address: '',
          telephone_number: '',
          success: 'تمت الإضافة بنجاح!',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // Wait for 1 second before going back
      })
      .catch((err) => {
        setCivillian({
          ...civillian,
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
      {civillian.err && (
        <Alert variant="danger" className="p-2">
          {civillian.err}
        </Alert>
      )}
      {civillian.success && (
        <Alert variant="success" className="p-2">
          {civillian.success}
        </Alert>
      )}
      <Form onSubmit={createCivillian} className="form">
        <Form.Group controlId="nationalID" className="form-group">
          <Form.Label>الرقم القومي</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل الرقم القومي"
            value={civillian.nationalID}
            onChange={(e) => setCivillian({ ...civillian, nationalID: e.target.value })}
            className="form-control"
          />
        </Form.Group>



        <Form.Group controlId="name" className="form-group">
          <Form.Label>اسم المدني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المدني"
            value={civillian.name}
            onChange={(e) => setCivillian({ ...civillian, name: e.target.value })}
            className="form-control"
          />
        </Form.Group>

        <Form.Group controlId="department" className="form-group">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            value={civillian.department}
            onChange={(e) => setCivillian({ ...civillian, department: e.target.value })}
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
    value={civillian.join_date}
    onChange={(e) => setCivillian({ ...civillian, join_date: e.target.value })}
    className="form-control"
  />
</Form.Group>

        <Form.Group controlId="address" className="form-group">
          <Form.Label>العنوان</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل العنوان"
            value={civillian.address}
            onChange={(e) => setCivillian({ ...civillian, address: e.target.value })}
            className="form-control"
          />


        </Form.Group>




<Form.Group controlId="dob" className="form-group">
  <Form.Label>تاريخ الميلاد</Form.Label>
  <Form.Control
    type="date"
    placeholder="أدخل تاريخ الميلاد"
    value={civillian.dob}
    onChange={(e) => setCivillian({ ...civillian, dob: e.target.value })}
    className="form-control"
  />
</Form.Group>



        <Form.Group controlId="telephone_number" className="form-group">
          <Form.Label>رقم الهاتف</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل رقم الهاتف"
            value={civillian.telephone_number}
            onChange={(e) => setCivillian({ ...civillian, telephone_number: e.target.value })}
            className="form-control"
          />


        </Form.Group>

        <Button variant="primary" type="submit" className="submit-btn" disabled={civillian.loading}>
          {civillian.loading ? 'جاري الإضافة...' : 'إضافة'}
        </Button>
      </Form>
    </div>
  );
};

export default AddCivillians;
