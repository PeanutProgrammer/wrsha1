import React, { useState , useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './ManageBuses.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const UpdateBus = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  
    const [bus, setBus] = useState({
      loading : false ,
      err : "" ,
      code: "",
      capacity: "",
      model: "",
      success : null,
      reload : false,
    });
  
    const updateBus =(e) => {
      e.preventDefault() ;
      setBus ({...bus, loading :true})
  
      // const formData = new FormData();
      // formData.append ("code",bus.code);
      // formData.append ("capacity",bus.capacity);
      // formData.append ("model",bus.model);
      
      const data = {
        code: bus.code,
        capacity: bus.capacity,
        model: bus.model
      }
  
      axios
        .put('http://localhost:4001/Busses/' + id, data, {
          headers: {
          token: auth.token
        }
      })
        .then(resp => {
          setBus({
        ...bus,
        loading: false,
        success: 'Bus updated successfully!',
        err: '',
      });

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

        console.log(data);

  
      }); 
  
    }
  
    useEffect(() => {
  
      axios
        .get('http://localhost:4001/Busses/' + id, {
          headers: {
        token: auth.token
      }})
      .then(resp => {
        setBus({
          ...bus,
         code: resp.data[0].code,
         capacity : resp.data[0].capacity ,
         model : resp.data[0].model ,
         
        })
      })
      .catch(err => {  
        setBus({
          ...bus,
          loading : false ,
          err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          success : null,
  
        })


  
      });
     
    }, [bus.reload])

  return (
    <div className="Update">
      <h1 className="text-center p-2">Update Bus</h1>
      
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
      
      <Form onSubmit={updateBus}>
        <Form.Group controlId="code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            name="Code"
            placeholder="Enter Code"
            value={bus.code}
            onChange={(e) => setBus({...bus, code:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="capacity">
          <Form.Label>Capacity</Form.Label>
          <Form.Control
            type="number"
            name="capacity"
            placeholder="Enter bus capacity"
            value={bus.capacity}
            onChange={(e) => setBus({...bus, capacity:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="model">
          <Form.Label>Model</Form.Label>
          <Form.Control
            type="text"
            name="model"
            placeholder="Enter bus model"
            value={bus.model}
            onChange={(e) => setBus({...bus, model:e.target.value})}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Update Bus
        </Button>
      </Form>
    </div>
  );
};

export default UpdateBus;