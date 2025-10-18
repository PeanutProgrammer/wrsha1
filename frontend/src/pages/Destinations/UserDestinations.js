import React, { useState, useEffect } from 'react';
import './Destinations.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const UserDestinations = () => {
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



  return (
    <div className="Destinations p-5">
      


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
          </tr>
        </thead>
        <tbody>
        {destinations.results.map((destination) => (
            <tr key={destination.id}>
            <td>{destination.code}</td>
            <td>{destination.name}</td>

            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserDestinations;


