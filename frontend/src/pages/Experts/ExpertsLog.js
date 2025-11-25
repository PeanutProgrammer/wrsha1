import React, { useState, useEffect } from 'react';
import './Expert.css';
import { Table ,Alert} from 'react-bootstrap';
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const now = moment().format("YYYY-MM-DD HH:mm:ss");

const ExpertsLog = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  const [experts, setExperts] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setExperts({ ...experts,loading : true});
    axios.get('http://localhost:4001/ExpertLog',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setExperts({ ...experts, results: resp.data, loading: false, err: null });
        console.log(resp.data);
      })
      .catch(err => {
        setExperts({
          ...experts,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [experts.reload]);



  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة تمام الخبراء</h3>
      </div>


      {experts.err && (
        <Alert variant="danger" className="p-2">
          {experts.err}
        </Alert>
      )}
      {experts.success && (
        <Alert variant="success" className="p-2">
          {experts.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الرقم القومي</th>
           <th>الإسم</th>
            <th>رقم التصديق الأمني</th>
           <th>اسم الشركة</th>
            <th>حالة التصديق</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
            <th>الفرع / الورشة</th>
            <th>الضابط المرافق</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
        {experts.results.map((expert) => (
            <tr key={expert.nationalID}>
            <td>{expert.nationalID}</td>    
            <td>{expert.name}</td>
            <td>{expert.security_clearance_number}</td>
            <td>{expert.company_name}</td>
            <td
                            className={
                moment(expert.valid_from).isBefore(now) && moment(expert.valid_through).isAfter(now)
                  ? 'bg-success text-white' // Valid: green
                  : moment(expert.valid_through).isBefore(now)
                  ? 'bg-danger text-white' // Expired: red
                  : moment(expert.valid_from).isAfter(now)
                  ? 'bg-warning text-dark'  // Not started yet: yellow
                  : 'bg-danger text-white'  // fallback
              }> {moment(expert.valid_from).isBefore(now) && moment(expert.valid_through).isAfter(now)
                ? 'ساري'
                : moment(expert.valid_through).isBefore(now)
                ? 'منتهي'
                : moment(expert.valid_from).isAfter(now)
                ? 'لم يبدأ بعد'  // Optional, if you want to display something for experts who haven't started yet
                : 'منتهي' // fallback for invalid state
              }</td>

            <td>
  {expert.start_date
    ? new Date(expert.start_date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "لا يوجد"}
</td>

            <td>
  {expert.end_date
    ? new Date(expert.end_date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "لا يوجد"}
</td>

<td>{expert.department ? expert.department : "لا يوجد"}</td>

            <td>{expert.officerName? (`${expert.rank} / ${expert.officerName}`) : expert.external_officer}</td>
            <td>{expert.notes ? expert.notes : "لا يوجد"}</td>

            {/* <td >{officer.tmam? officer.tmam: "متواجد"}</td> */}
              
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ExpertsLog;


