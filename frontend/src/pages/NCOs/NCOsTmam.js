import React, { useState, useEffect } from 'react';
import './NCO.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const NCOsTmam = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [ncos, setNCOs] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setNCOs({ ...ncos,loading : true});
    axios.get('http://localhost:4001/NCO/tmam',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setNCOs({ ...ncos, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setNCOs({
          ...ncos,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [ncos.reload]);

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
        <h3 className="text-center mb-3">إدارة تمام ضباط الصف</h3>
        {/* <Link to={"AddOfficers"} className="btn btn-success mb-4"> إنشاء ضابط جديد +</Link> */}
      </div>


      {ncos.err && (
        <Alert variant="danger" className="p-2">
          {ncos.err}
        </Alert>
      )}
      {ncos.success && (
        <Alert variant="success" className="p-2">
          {ncos.success}
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
        {ncos.results.map((officer) => (
            <tr key={officer.mil_id}>
            <td>{officer.mil_id}</td>    
            <td>{officer.rank}</td>
            <td>{officer.name}</td>
            <td>{officer.department}</td>
            <td >{officer.tmam? officer.tmam: "متواجد"}</td>
              <td>
                {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.mil_id)}}>حذف</button> */}
                {/* <Link to={`${officer.mil_id}`} className="btn btn-sm btn-primary mx-1 p-2">تعديل</Link> */}
                <Link to={`details/${officer.mil_id}`} className="btn btn-sm btn-primary mx-1 p-2">تفاصيل </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default NCOsTmam;


