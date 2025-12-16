import React, { useState, useEffect } from 'react';
import "../../style/style.css";
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const OfficersTmam = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [officers, setOfficers] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setOfficers({ ...officers,loading : true});
    axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/Officer/tmam`,  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setOfficers({ ...officers, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setOfficers({
          ...officers,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [officers.reload]);

//   const deleteOfficer = (mil_id) =>{
//     axios.delete('http://192.168.1.3:4001/Officer/' + mil_id, {
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
        <h3 className="text-center mb-3">إدارة تمام الضباط</h3>
        {/* <Link to={"AddOfficers"} className="btn btn-success mb-4"> إنشاء ضابط جديد +</Link> */}
      </div>


      {officers.err && (
        <Alert variant="danger" className="p-2">
          {officers.err}
        </Alert>
      )}
      {officers.success && (
        <Alert variant="success" className="p-2">
          {officers.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>م</th>
            <th>الرقم العسكري</th>
            <th>الرتبة</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>التمام</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {officers.results.map((officer, index) => (
            <tr key={officer.mil_id}>
            <td>{index + 1}</td> {/* Arabic numbering, starting from 1 */}
            <td>{officer.mil_id}</td>    
            <td>{officer.rank}</td>
            <td>{officer.name}</td>
            <td>{officer.department}</td>
            <td >{(officer.in_unit? "متواجد" : (officer.tmam ? officer.tmam : "غير متواجد"))}</td>
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

export default OfficersTmam;


