import React, { useState, useEffect } from 'react';
import './Soldier.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const SoldiersTmam = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [soldiers, setSoldiers] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setSoldiers({ ...soldiers,loading : true});
    axios.get('http://localhost:4001/soldier/tmam',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setSoldiers({ ...soldiers, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setSoldiers({
          ...soldiers,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [soldiers.reload]);

//   const deleteOfficer = (mil_id) =>{
//     axios.delete('http://localhost:4001/Officer/' + mil_id, {
//       headers: {
//         token: auth.token
//       }
//     })
//       .then(resp => {
//         setOfficers ({...officers , reload : officers.reload +1})
//       })
//       .catch(err => {
//         setOfficers({ 
//             err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
//           });

//       });

//   }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة تمام الجنود</h3>
        {/* <Link to={"AddOfficers"} className="btn btn-success mb-4"> إنشاء ضابط جديد +</Link> */}
      </div>


      {soldiers.err && (
        <Alert variant="danger" className="p-2">
          {soldiers.err}
        </Alert>
      )}
      {soldiers.success && (
        <Alert variant="success" className="p-2">
          {soldiers.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الرقم العسكري</th>
            <th>الدرجة</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>التمام</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {soldiers.results.map((soldier) => (
            <tr key={soldier.mil_id}>
            <td>{soldier.mil_id}</td>    
            <td>{soldier.rank}</td>
            <td>{soldier.name}</td>
            <td>{soldier.department}</td>
            <td >{soldier.tmam? soldier.tmam: "متواجد"}</td>
              <td>
                {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.mil_id)}}>حذف</button> */}
                {/* <Link to={`${officer.mil_id}`} className="btn btn-sm btn-primary mx-1 p-2">تعديل</Link> */}
                <Link to={`details/${soldier.mil_id}`} className="btn btn-sm btn-primary mx-1 p-2">تفاصيل </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SoldiersTmam;


