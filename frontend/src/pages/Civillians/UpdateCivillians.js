import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Civillian.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const UpdateCivillians = () => {
  const auth = getAuthUser();
  let { id } = useParams();

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

  const UpdateCivillians = (e) => {
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
      .put('http://localhost:4001/civillian/' + id, data, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillian({
          ...civillian,
          loading: false,
          success: 'تم تعديل بيانات المدني بنجاح!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch((err) => {
        setCivillian({
          ...civillian,
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
      .get('http://localhost:4001/civillian/' + id, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillian({
          ...civillian,
          nationalID: resp.data._nationalID,
          name: resp.data._name,
          department: resp.data._department,
          // Just store join_date as received (string), or format to YYYY-MM-DD
          join_date: resp.data._join_date ? formatDateToInput(resp.data._join_date) : '',
          dob: resp.data._dob ? formatDateToInput(resp.data._dob) : '',
          address: resp.data._address,
          telephone_number: resp.data._telephone_number,

          
        });
      })
      .catch((err) => {
        setCivillian({
          ...civillian,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : 'Something went wrong. Please try again later.',
          success: null,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [civillian.reload]);

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

      <h1 className="text-center p-2">تعديل بيانات المدني</h1>

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
      <Form onSubmit={UpdateCivillians}>
        <Form.Group controlId="nationalID">
          <Form.Label>الرقم القومي</Form.Label>
          <Form.Control
            type="number"
            placeholder="أدخل الرقم القومي"
            value={civillian.nationalID}
            onChange={(e) => setCivillian({ ...civillian, nationalID: e.target.value })}
          />
        </Form.Group>

        <Form.Group controlId="name">
          <Form.Label>إسم المدني</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل إسم المدني"
            value={civillian.name}
            onChange={(e) => setCivillian({ ...civillian, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="department">
          <Form.Label>الورشة / الفرع</Form.Label>
          <Form.Control
            as="select"
            placeholder="أدخل الورشة / الفرع"
            value={civillian.department}
            onChange={(e) => setCivillian({ ...civillian, department: e.target.value })}
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
            value={civillian.join_date}
            onChange={(e) => setCivillian({ ...civillian, join_date: e.target.value })}
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


        <Form.Group controlId="join_date">
          <Form.Label>تاريخ الميلاد</Form.Label>
          <Form.Control
            type="date"
            value={civillian.dob}
            onChange={(e) => setCivillian({ ...civillian, dob: e.target.value })}
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

        <Button variant="primary" type="submit" className="mt-3">
          تعديل المدني
        </Button>
      </Form>
    </div>
  );
};

export default UpdateCivillians;
