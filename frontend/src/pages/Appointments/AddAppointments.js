import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Appointements.css';
import axios from 'axios';
import ReactDatetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import { getAuthUser } from '../../helper/Storage';
import { useEffect } from 'react';


const AddAppointments = () => {
  const auth = getAuthUser()
  const [appointment, setAppointment] = useState({
    loading : false ,
    err : "" ,
    code : "",
    source : "",
    destination : "",
    start_datetime : new Date(),
    end_datetime: new Date(),
    bus: "",
    price : "",
    success : null,
  });

  const [city, setCity] = useState([]);
  const [busCodes, setBuses] = useState([]);
  useEffect(() => {
    axios
      .get('http://localhost:4001/Busses',  {
        headers: {
          token: auth.token
        }
      })
      .then(resp => setBuses(resp.data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:4001/destinations/',  {
        headers: {
          token: auth.token
        }
      })
      .then(resp => setCity(resp.data))
      .catch(err => console.log(err));
  }, []);

  

  

  const createappointement =(e) => {
    e.preventDefault() ;
    setAppointment ({...appointment, loading :true})

    // const formData = new FormData();
    // formData.append ("id",appointment.id);
    // formData.append ("from",appointment.source);
    // formData.append ("to",appointment.destination);
    // formData.append ("date",appointment.start_datetime);
    // formData.append ("time",appointment.end_datetime);
    // formData.append ("price",appointment.price);

    const data = {
      code: appointment.code,
      source: appointment.source,
      destination: appointment.destination,
      start_datetime: appointment.start_datetime.toISOString(),
      end_datetime: appointment.end_datetime.toISOString(),
      bus: appointment.bus,
      price: appointment.price
    }

    axios
      .post('http://localhost:4001/Appointments/', data, {
        headers: {
        token: auth.token
      }
    })
    .then(resp => {
      setAppointment({
        loading: false,
        err: null,
        code: "",
        source: "",
        destination: "",
        start_datetime: new Date(),
        end_datetime: new Date(),
        bus: "",
        price: "",
        success: "Added Success",
      });
    
      setTimeout(() => {
        window.history.back();
      }, 1000);
    })
      .catch(err => {  
      console.log(err.response.data.errors[0].msg);
      setAppointment({
        ...appointment,
        loading: false,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later.",
        success: null,
      });

      
    });
    

  }





 
  return (
    <div className="add">
      <h1 className="text-center p-2">Add Appointments</h1>
      {appointment.err && (
        <Alert variant="danger" className="p-2">
          {appointment.err}
        </Alert>
      )}
      {appointment.success && (
        <Alert variant="success" className="p-2">
          {appointment.success}
        </Alert>
      )}
      <Form onSubmit={createappointement}>
        <Form.Group controlId="code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Code"
            value={appointment.code}
            onChange={(e) => setAppointment({...appointment, code:e.target.value})}

          />
        </Form.Group>

        <Form.Group controlId="Source">
  <Form.Label> Source City</Form.Label>
  <Form.Control
    as="select"
    value={appointment.source}
    onChange={(e) => setAppointment({ ...appointment, source: e.target.value })}
  >
    <option value="">Select a source city</option>
    {city.map(cit => (
      <option key={cit.id} value={cit.code}>{cit.name}</option>
    ))}
  </Form.Control>
</Form.Group>

<Form.Group controlId="Destination">
  <Form.Label> Destination City</Form.Label>
  <Form.Control
    as="select"
    value={appointment.destination}
    onChange={(e) => setAppointment({ ...appointment, destination: e.target.value })}
  >
    <option value="">Select a destination city</option>
    {city.map(cit => (
      <option key={cit.id} value={cit.code}>{cit.name}</option>
    ))}
  </Form.Control>
</Form.Group>

        <Form.Group controlId="start_datetime">
          <Form.Label>Start Date and Time</Form.Label>
          <ReactDatetime
            value={appointment.start_datetime}
            onChange={(e) =>
              setAppointment({ ...appointment, start_datetime: moment(e).toDate() })
            }
            inputProps={{ placeholder: "Enter Start Date and Time" }}
            timeFormat="HH:mm:ss"
            dateFormat = "yyyy-MM-DD"
          />
        </Form.Group>

        <Form.Group controlId="end_datetime">
          <Form.Label>End Date and Time</Form.Label>
          <ReactDatetime
            value={appointment.end_datetime}
            onChange={(e) =>
              setAppointment({ ...appointment, end_datetime: moment(e).toDate() })
            }
            inputProps={{ placeholder: "Enter End Date and Time" }}
            timeFormat="HH:mm:ss"
            dateFormat="yyyy-MM-DD"
          />
        </Form.Group>




        <Form.Group controlId="bus">
  <Form.Label>Bus Code</Form.Label>
  <Form.Control
    as="select"
    value={appointment.bus}
    onChange={(e) => setAppointment({ ...appointment, bus: e.target.value })}
  >
    <option value="">Select a bus code</option>
    {busCodes.map(bus => (
      <option key={bus.id} value={bus.code}>{bus.code}</option>
    ))}
  </Form.Control>
</Form.Group>




        <Form.Group controlId="Price">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter Price"
            value={appointment.price}
            onChange={(e) => setAppointment({...appointment, price:e.target.value})}

          />
        </Form.Group>

        {/* <Form.Group controlId="Bus Capacity">
          <Form.Label>Bus Capacity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter Bus Capacity"
            value={appointment.capacity}
            onChange={(e) => setAppointment({...appointment, capacity:e.target.value})}
          />
        </Form.Group> */}

        <Button variant="primary" type="submit" className="mt-3">
          Add Appointments
        </Button>
      </Form>
    </div>
  );
};

export default AddAppointments;