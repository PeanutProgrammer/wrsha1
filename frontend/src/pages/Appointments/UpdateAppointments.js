import React, { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Appointements.css';
import ReactDatetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import { getAuthUser } from '../../helper/Storage';

const UpdateAppointments = () => {
  const auth = getAuthUser()
  let {id} = useParams();

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
    reload : false,
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


  const updateappointement =(e) => {
    e.preventDefault() ;
    setAppointment ({...appointment, loading :true})

    // const formData = new FormData();
    // formData.append ("id",appointment.id);
    // formData.append ("from",appointment.from);
    // formData.append ("to",appointment.to);
    // formData.append ("date",appointment.date);
    // formData.append ("time",appointment.time);
    // formData.append ("price",appointment.price);

    const data = {
      code: appointment.code,
      source: appointment.source,
      destination: appointment.destination,
      start_datetime: moment(appointment.start_datetime).toISOString(),
      end_datetime: moment(appointment.end_datetime).toISOString(),
      bus: appointment.bus,
      price: appointment.price
    }

    axios
      .put('http://localhost:4001/Appointments/' + id, data, {
        headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setAppointment({
          ...appointment,
          loading: false,
          success: 'Appointment updated successfully!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // wait for 1 seconds before going back
    })
    .catch(err => {  
      setAppointment({
        ...appointment,
        loading : false ,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
        success : null,

      })

    }); 

  }

  useEffect(() => {
    console.log("hello");

    axios
      .get('http://localhost:4001/Appointments/' + id,  {
        headers: {
        token: auth.token
      }
    })
      .then(resp => {
        console.log(resp);
      setAppointment({
        ...appointment,
       code : resp.data[0].code ,
       source : resp.data[0].source,
       destination : resp.data[0].destination ,
       start_datetime : resp.data[0].start_datetime ,
       end_datetime: resp.data[0].end_datetime,
       bus: resp.data[0].bus,
       price : resp.data[0].price ,
      })
        

    })
    .catch(err => {  
      setAppointment({
        ...appointment,
        loading : false ,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
        success : null,

      })

    });
   
  }, [appointment.reload])
  

  return (
    <div className="Update">
      <h1 className="text-center p-2">Update Appointments</h1>
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
      <Form onSubmit={updateappointement}>
        <Form.Group controlId="id">
          <Form.Label>Code</Form.Label>
          <Form.Control type="text" placeholder="Enter Code" 
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
    onChange={(e) => setAppointment({ ...appointment, destination: e.target.value })}>
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
          <Form.Control type="number" placeholder="Enter Price" 
           value={appointment.price}
           onChange={(e) => setAppointment({...appointment, price:e.target.value})}

          />
        </Form.Group>


        <Button variant="primary" type="submit" className="mt-3">
          Update Appointments
        </Button>
      </Form>
    </div>
  );
};

export default UpdateAppointments;