import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import './Travellers.css';
import { useRef } from 'react';
import { getAuthUser } from '../../helper/Storage';

const AddTravellers = () => {
  const auth = getAuthUser()
  const [traveller, setTraveller] = useState({
    loading: false,
    err: "",
    name: "",
    email: "",
    password: "",
    image: null,
    success: null,
  });

  const image = useRef(null)

  const createtraveller = (e) => {
    e.preventDefault();
    setTraveller({...traveller, loading: true});

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
    //   image: traveller.image
    // }

    axios.post("http://localhost:4001/user/", formData, {
      headers: {
        token: auth.token
    }})
      .then(resp => {
        setTraveller({
          loading: false,
          err: null,
          name: "",
          email: "",
          password: "",
          image: null,
          success: "Added successfully",
        });
        image.current.files = null;
        setTimeout(() => {
          window.history.back();
        }, 1000);
      })
      .catch(err => {
        setTraveller({
          ...traveller,
          loading: false,
          err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later.",
          success: null,
        });

        console.log(traveller.err);
      });
  };

 


  return (
    <div className="add">
      <h1 className="text-center p-2">Add Travellers</h1>
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
      <Form onSubmit={createtraveller}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Name"
            value={traveller.name}
            onChange={(e) => setTraveller({...traveller, name: e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={traveller.email}
            onChange={(e) => setTraveller({...traveller, email: e.target.value})}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={traveller.password}
            onChange={(e) => setTraveller({...traveller, password: e.target.value})}
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
          Add Travellers
        </Button>
      </Form>
    </div>
  );
};

export default AddTravellers;