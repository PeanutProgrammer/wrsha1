import React, { useState, useEffect } from 'react';
import './Civillian.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const CivilliansTmam = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [civillians, setCivillians] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setCivillians({ ...civillians,loading : true});
    axios.get('http://localhost:4001/civillian/tmam',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setCivillians({ ...civillians, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setCivillians({
          ...civillians,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [civillians.reload]);

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
        <h3 className="text-center mb-3">إدارة تمام المدنيين</h3>
        {/* <Link to={"AddOfficers"} className="btn btn-success mb-4"> إنشاء ضابط جديد +</Link> */}
      </div>


      {civillians.err && (
        <Alert variant="danger" className="p-2">
          {civillians.err}
        </Alert>
      )}
      {civillians.success && (
        <Alert variant="success" className="p-2">
          {civillians.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الرقم القومي</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>التمام</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {civillians.results.map((civillian) => (
            <tr key={civillian.nationalID}>
            <td>{civillian.nationalID}</td>    
            <td>{civillian.name}</td>
            <td>{civillian.department}</td>
            <td >{civillian.tmam? civillian.tmam: "متواجد"}</td>
              <td>
                {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.mil_id)}}>حذف</button> */}
                {/* <Link to={`${officer.mil_id}`} className="btn btn-sm btn-primary mx-1 p-2">تعديل</Link> */}
                <Link to={`details/${civillian.nationalID}`} className="btn btn-sm btn-primary mx-1 p-2">تفاصيل </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CivilliansTmam;


