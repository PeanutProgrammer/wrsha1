import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Destinations.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const UpdateDestinations = () => {
  const auth = getAuthUser()
  let {id} = useParams();

  const [destination, setDestination] = useState({
    loading : false ,
    err : "" ,
    name: "",
    code: "", 
    success : null,
    reload : false,
  });

  const updateDestinations = (e) => {
    e.preventDefault();
    setDestination({ ...destination, loading: true });
  
    // const formData = new FormData();
    // formData.append('code', destination.code);
    // formData.append('name', destination.name);

   const data = {
      code: destination.code,
      name: destination.name
    }
    
    axios
      .put('http://localhost:4001/destinations/' + id, data, {
        headers: {
          token: auth.token
        }
      })
      .then((resp) => {
        setDestination({
          ...destination,
          loading: false,
          success: 'Destination updated successfully!',
          err: '',
        });

        setTimeout(() => {
          window.history.back();
        }, 1000); // wait for 1 seconds before going back
      })
      .catch((err) => {
        setDestination({
          ...destination,
          loading: false,
          err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later.",
          success: null,
        });
        console.log(err);
      });
  };
  

  useEffect(() => {

    axios
      .get('http://localhost:4001/destinations/' + id,  {
        headers: {
        token: auth.token
      }
    })
    .then(resp => {
      setDestination({
        ...destination,
        name: resp.data[0].name,
       code: resp.data[0].code,
       
      })
      console.log(resp.data[0].name);
    })
    .catch(err => {  
      setDestination({
        ...destination,
        loading : false ,
        err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later.",
        success : null,

      })

    });
   
  }, [destination.reload])

  return (
    <div className="Update">
      <h1 className="text-center p-2">Update Destinations</h1>
      
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
      <Form onSubmit={updateDestinations}>
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
            placeholder="Enter Destination name"
           value={destination.name}
           onChange={(e) => setDestination({...destination, name:e.target.value})}
            
          />
        </Form.Group>
        
        <Button variant="primary" type="submit" className="mt-3">
          Update Destinations
        </Button>
      </Form>
      

    </div>
  );
};

export default UpdateDestinations;