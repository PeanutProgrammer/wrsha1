import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './ManageBuses.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const ManageBuses = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  const [buses, setBuses] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setBuses({ ...buses,loading : true});
    axios.get('http://localhost:4001/Busses/', {
      headers: {
      token: auth.token
    }})
      .then(resp => {
        setBuses({...buses, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setBuses({
          ...buses,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [buses.reload]);

  const deletebus =(id) =>{
    axios.delete('http://localhost:4001/Busses/' + id, {
      headers: {
      token: auth.token
    }})
      .then(resp => {
        setBuses ({...buses , reload : buses.reload +1})
      })
      .catch(err => {
        setBuses({ 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      });

  }

  return (
    <div className="bus p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">MANAGE BUSES</h3>
        <Link to={'AddBus'} className="btn btn-success mb-4">
          Create New Bus +
        </Link>
      </div>
      {buses.err && (
        <Alert variant="danger" className="p-2">
          {buses.err}
        </Alert>
      )}
      {buses.success && (
        <Alert variant="success" className="p-2">
          {buses.success}
        </Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Code</th>
            <th>Capacity</th>
            <th>Model</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {buses.results.map((bus) => (
          <tr key={bus.id}>
            <td>{ bus.code}</td>
              <td>{bus.capacity}</td>
              <td>{bus.model}</td>
              
              <td>
                <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deletebus(bus.id)}}>Delete</button>
                <Link to={`${bus.id}`} className="btn btn-sm btn-primary mx-1 p-2">Update</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageBuses;