import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './ManageBuses.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const UserBusses = () => {
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



  return (
    <div className="bus p-5">
      
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
          </tr>
        </thead>
        <tbody>
        {buses.results.map((bus) => (
          <tr key={bus.id}>
            <td>{ bus.code}</td>
              <td>{bus.capacity}</td>
              <td>{bus.model}</td>
              
              
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserBusses;