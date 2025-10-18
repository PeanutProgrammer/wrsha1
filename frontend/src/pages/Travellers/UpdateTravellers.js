import React, { useState ,useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './Travellers.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useRef } from 'react';
import { getAuthUser } from '../../helper/Storage';

const UpdateTravellers = () => {
  //////
  let { id } = useParams();
  const auth = getAuthUser()
  
    const [traveller, setTraveller] = useState({
      loading : false ,
      err : "" ,
      name : "",
      email : "",
      password: "",
      image: "",
      success : null,
      reload : false,
    });
  
    const image = useRef(null)

  
    const updateTraveller =(e) => {
      e.preventDefault() ;
      setTraveller ({...traveller, loading :true})
  
      const formData = new FormData();
    formData.append("name", traveller.name);
    formData.append("email", traveller.email);
    formData.append("password", traveller.password);
    if (image.current.files && image.current.files[0]) {
      formData.append("image", image.current.files[0]);

    }

      // const data = {
      //   name: traveller.name,
      //   email: traveller.email,
      //   password: traveller.password,
      // }
      
  
     /////////////////////id
      axios
        .put('http://localhost:4001/user/' + id, formData, {
          headers: {
        token: auth.token
      }})
        .then(resp => {
          setTraveller({
            ...traveller,
            loading: false,
            success: 'Traveller updated successfully!',
            err: '',
          });
          image.current.files = null;

          setTimeout(() => {
            window.history.back();
          }, 1000);
      })
      .catch(err => {  
        setTraveller({
          ...traveller,
          loading : false ,
          err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          success : null,
  
        })

       
  
      }); 
  
    }
  
    useEffect(() => {
      console.log(id);

      axios
        .get('http://localhost:4001/user/' + id, {
          headers: {
        token: auth.token
      }})
        .then(resp => {
        setTraveller({
          ...traveller,
         name : resp.data._name ,
         email : resp.data._email ,
         
         
        })
          

      })
      .catch(err => {  
        setTraveller({
          ...traveller,
          loading : false ,
          err: "something error please try again!" ,
          success : null,
  
        })
  
      });
     
    }, [traveller.reload])


  return (
    <div className="Update">
      <h1 className="text-center p-2">Update Travellers</h1>
      {traveller.err && (
        <Alert variant="danger" className="p-2">
          {traveller.err}
        </Alert>
      )}
      {traveller.success && (
        <Alert variant="success" className="p-2">
          {traveller.success}
        </Alert>
      )}
      <Form onSubmit={updateTraveller}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Name"
            value={traveller.name}
            onChange={(e) => setTraveller({...traveller, name:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={traveller.email}
            onChange={(e) => setTraveller({...traveller, email:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder=""
            
            onChange={(e) => setTraveller({...traveller, password:e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="image">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            ref={image}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Update Travellers
        </Button>
      </Form>
    </div>
  );
};

export default UpdateTravellers;