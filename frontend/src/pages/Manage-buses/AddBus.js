import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './ManageBuses.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const AddBus = () => {
  const auth = getAuthUser()
  const [bus, setBus] = useState({
    loading : false ,
    err : "" ,
    code : "",
    capacity : "",
    model : "", 
    success : null,
  });

  const createbus =(e) => {
    e.preventDefault() ;
    setBus ({...bus, loading :true})

    // const formData = new FormData();
    // formData.append ("id",bus.id);
    // formData.append ("capacity",bus.capacity);
    // formData.append ("model",bus.model);

    const data = {
      code: bus.code,
      capacity: bus.capacity,
      model: bus.model
    }
    

    axios
      .post('http://localhost:4001/Busses/', data, {
        headers: {
        token: auth.token
      }
    })
    .then(resp => {
      setBus({
        loading : false ,
        err : null ,
        code : "",
        capacity : "",
        model : "",
        success : "Added Success",

      })

      setTimeout(() => {
        window.history.back();
      }, 1000); // wait for 1 seconds before going back
    })
    .catch(err => {  
      setBus({
        ...bus,
        loading : false ,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
        success : null,

      })

    }); 

  }

  return (
    <div className="add">
      <h1 className="text-center p-2">Add Bus</h1>
      {bus.err && (
        <Alert variant="danger" className="p-2">
          {bus.err}
        </Alert>
      )}
      {bus.success && (
        <Alert variant="success" className="p-2">
          {bus.success}
        </Alert>
      )}
      <Form onSubmit={createbus}>
        <Form.Group controlId="code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Code"
            value={bus.code}
            onChange={(e) => setBus({...bus, code:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="capacity">
          <Form.Label>Capacity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter bus capacity"
            value={bus.capacity}
            onChange={(e) => setBus({...bus, capacity:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="model">
          <Form.Label>Model</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter bus model"
            value={bus.model}
            onChange={(e) => setBus({...bus, model:e.target.value})}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Add Bus
        </Button>
      </Form>
    </div>
  );
};

export default AddBus;