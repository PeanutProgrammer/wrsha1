import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const GuestDeparture = () => {
  const auth = getAuthUser();
  const [Guests, setGuests] = useState({
    loading: true,
    err: null,
    success: null,
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  const [noGuestsMessage, setNoGuestsMessage] = useState(''); // State for "No guests found" message

  useEffect(() => {
    setGuests({ ...Guests, loading: true });
    axios
      .get('http://192.168.1.3:4001/guest/current', {
        headers: { token: auth.token },
      })
      .then((resp) => {
        if (resp.data.msg === 'No guests with null visit_end found') {
          setNoGuestsMessage('لا يوجد زوار حالياً.');  // Set the "No guests found" message
        } else {
          setGuests({
            ...Guests,
            results: resp.data,
            loading: false,
            err: null,
          });
          setNoGuestsMessage('');  // Clear any previous "No guests" message
        }
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.msg) {
          if (err.response.data.msg === 'No guests with null visit_end found') {
            setNoGuestsMessage('لا يوجد زوار حالياً.'); // Display the "No guests found" message
          } else {
            setGuests({
              ...Guests,
              loading: false,
              err: err.response.data.msg || 'حدث خطأ أثناء تحميل البيانات.',
            });
          }
        } else {
          setGuests({
            ...Guests,
            loading: false,
            err: 'حدث خطأ أثناء تحميل البيانات.',
          });
        }
      });
  }, [Guests.reload]);

  const endVisit = (guestId) => {
    const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss"); // Current time

    axios
      .put(`http://192.168.1.3:4001/guest/end-visit/${guestId}`, { visit_end: visitEnd }, {
        headers: {
          token: auth.token,
        },
      })
      .then((response) => {
        setGuests({
          ...Guests,
          reload: Guests.reload + 1,
          success: 'تم إنهاء الزيارة بنجاح ✅',
          err: null,
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setGuests((prev) => ({ ...prev, success: null }));
        }, 3000);

        // Remove guest from the table after 5 seconds
        setTimeout(() => {
          setGuests((prev) => ({
            ...prev,
            results: prev.results.filter((guest) => guest.id !== guestId),
          }));
        }, 5000);
      })
      .catch((err) => {
        setGuests({
          ...Guests,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة إنهاء الزيارة.',
        });
      });
  };
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = Guests.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(Guests.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">الزوار المتواجدين</h3>
      </div>

      {/* Success Message */}
      {Guests.success && (
        <Alert variant="success" className="p-2 text-center">
          {Guests.success}
        </Alert>
      )}

      {/* Error Message */}
      {Guests.err && (
        <Alert variant="danger" className="p-2 text-center">
          {Guests.err}
        </Alert>
      )}

      {/* "No guests found" message */}
      {noGuestsMessage && (
        <Alert variant="info" className="p-2 text-center">
          {noGuestsMessage}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>الإسم</th>
              <th>زيارة إلى</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>سبب الزيارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((guest) => (
              <tr key={guest.id}>
                {/* <td>{guest.id}</td> */}
                <td>{guest.name}</td>
                <td>{guest.rank + " " + guest.officer_name}</td>
                <td>{moment(guest.visit_start).format('YYYY-MM-DD HH:mm')}</td>
                <td>
                  {/* Show the updated end time */}
                  {guest.visit_end ? moment(guest.visit_end).format('YYYY-MM-DD HH:mm') : 'لا يوجد'}
                </td>
                <td>{guest.reason ? guest.reason : "لا يوجد"}</td>
                <td>
                  <div className="action-buttons">
                    {!guest.visit_end && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => endVisit(guest.id)}
                      >
                        إنهاء الزيارة
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <button
          className="btn btn-light"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          السابق
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`btn btn-light page-btn ${currentPage === number ? 'active' : ''}`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="btn btn-light"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          التالي
        </button>
      </div>
    </div>
  );
};

export default GuestDeparture;
