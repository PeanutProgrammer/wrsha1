import React, { useState, useEffect } from 'react';
import './Destinations.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const Destinations = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  const [destinations, setDestinations] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setDestinations({ ...destinations,loading : true});
    axios.get('http://localhost:4001/destinations/',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setDestinations({ ...destinations, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setDestinations({
          ...destinations,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [destinations.reload]);

  const deletedestinations = (id) =>{
    axios.delete('http://localhost:4001/destinations/' + id, {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setDestinations ({...destinations , reload : destinations.reload +1})
      })
      .catch(err => {
        setDestinations({ 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      });

  }

  return (
    <div className="Destinations p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">MANAGE DESTINATIONS</h3>
        <Link to={"AddDestinations"} className="btn btn-success mb-4"> Create New Destinations +</Link>
      </div>


      {destinations.err && (
        <Alert variant="danger" className="p-2">
          {destinations.err}
        </Alert>
      )}
      {destinations.success && (
        <Alert variant="success" className="p-2">
          {destinations.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Code</th>
            <th>Destination Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {destinations.results.map((destination) => (
            <tr key={destination.id}>
            <td>{destination.code}</td>
            <td>{destination.name}</td>
              <td>
                <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deletedestinations(destination.id)}}>Delete</button>
                <Link to={`${destination.id}`} className="btn btn-sm btn-primary mx-1 p-2">Update</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Destinations;


