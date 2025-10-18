import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import '../Manage-buses/ManageBuses.css';
import './History.css'
import { getAuthUser } from '../../helper/Storage';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';

const History = () => {
const auth = getAuthUser();
  let {id} = useParams();
  const [history, setHistory] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setHistory({ ...history,loading : true});
      axios.get('http://localhost:4001/user/history', {
        headers: {
            token : auth.token 
        }
    } )
      .then(resp => {
        setHistory({...history, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setHistory({
          ...history,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [history.reload]);
    
  const deleteHistory =(id) =>{
      axios.delete('http://localhost:4001/user/history/'+id, {
          headers: {
            token: auth.token
        }
    })
      .then(resp => {
        setHistory ({...history , reload : history.reload +1,})
      })
      .catch(err => {
        setHistory({ 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      });

  }

 

  return (
      <div className="bus p-5">
         

      
      {history.err && (
        <Alert variant="danger" className="p-2" style>
          {history.err}
        </Alert>
      )}
      {history.success && (
        <Alert variant="success" className="p-2">
          {history.success}
        </Alert>
      )}

      <Table className='UniqueClass' striped bordered hover>
        <thead>
          <tr>
                      <th>Search History</th>
                      <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {history.results.map((hist) => (
          <tr key={hist.id}>
                <td>{hist.search}</td>
                <td>                   <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteHistory(hist.id)}}>Delete</button>
</td>
              
              
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default History;