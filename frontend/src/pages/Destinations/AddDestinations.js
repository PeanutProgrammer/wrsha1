import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Destinations.css';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const AddDestinations = () => {
  const auth = getAuthUser()
  const [destination, setDestination] = useState({
    loading : false ,
    err : "" ,
    name : "",
    code : "",
    success : null,
  });

  const createdestination =(e) => {
    e.preventDefault() ;
    setDestination ({...destination, loading :true})

    // const formData = new FormData();

    // formData.append ("code",destination.code);
    // formData.append("Destinations", destination.name);
    
    const data = {
      code: destination.code,
      name: destination.name
    }


    axios
      .post('http://localhost:4001/destinations/', data, {
        headers: {
          token: auth.token
        }
      })
    .then(resp => {
      setDestination({
        loading : false ,
        err : null ,
        name : "",
        success: "Added Success",


      })

   
      setTimeout(() => {
        window.history.back();
      }, 1000); // wait for 1 seconds before going back
    })
    .catch(err => {  
      setDestination({
        ...destination,
        loading : false ,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
        success : null,

      })

    }); 

  }

  return (
    <div className="add">
      <h1 className="text-center p-2">Add Destinations</h1>
      {destination.err && (
        <Alert variant="danger" className="p-2">
          {destination.err}
        </Alert>
      )}
      {destination.success && (
        <Alert variant="success" className="p-2">
          {destination.success}
        </Alert>
      )}
      <Form onSubmit={createdestination}>
        <Form.Group controlId="code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Code"
            value={destination.code}
            onChange={(e) => setDestination({...destination, code:e.target.value})}

          />
        </Form.Group>
        <Form.Group controlId="name">
          <Form.Label>Destination Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Destinations"
            value={destination.name}
            onChange={(e) => setDestination({...destination, name:e.target.value})}

          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Add Destinations
        </Button>
      </Form>
    </div>
  );
};

export default AddDestinations;