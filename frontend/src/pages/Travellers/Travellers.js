import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './Travellers.css';
import { Link ,useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const ManageTravellers = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  const [travellers, setTravellers] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setTravellers({ ...travellers,loading : true});
    axios.get('http://localhost:4001/user/', {
      headers: {
      token: auth.token
    }})
      .then(resp => {
        setTravellers({...travellers, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setTravellers({
          ...travellers,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [travellers.reload]);

  const deletetraveller=(id) =>{
    axios.delete('http://localhost:4001/user/' + id, {
      headers: {
      token: auth.token
    }})
      .then(resp => {
        setTravellers ({...travellers , reload : travellers.reload +1})
      })
      .catch(err => {
        setTravellers({ 
            err: "something went wrong, try again!" ,
          });

      });

  }

  console.log('travellers:', travellers);
  console.log('travellers.results:', travellers.results);


  return (
    <div className="bus p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">MANAGE TRAVELLERS</h3>
        <Link to={'AddTravellers'} className="btn btn-success mb-4">
          Create New Travellers +
        </Link>
      </div>

      {travellers.err && (
        <Alert variant="danger" className="p-2">
          {travellers.err}
        </Alert>
      )}
      {travellers.success && (
        <Alert variant="success" className="p-2">
          {travellers.success}
        </Alert>
      )}
      {travellers.results.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {travellers.results.map((traveller) => (
              <tr key={traveller.id}>
                <td>{traveller.name}</td>
                <td>{traveller.email}</td>
                <td>{traveller.status === 0 ? "offline" : "online"}</td>
                <td>
                  <button className="btn btn-sm btn-danger mx-1 p-2" onClick={(e) => { deletetraveller(traveller.id) }}>Delete</button>
                  <Link to={`${traveller.id}`} className="btn btn-sm btn-primary mx-1 p-2">Update</Link>
                  <Link to={`history/${traveller.id}`} className="btn btn-sm btn-primary mx-1 p-2">Show Requests History</Link>

                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ManageTravellers;