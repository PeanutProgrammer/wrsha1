import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form,  Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // This imports the autoTable plugin
import htmlDocx from 'html-docx-js/dist/html-docx';
import { FaPrint } from 'react-icons/fa';  // Import the printer icon from react-icons

// Import react-pdf components
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// import amiriFont from '..';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;  // Import font definitions for pdfMake
// pdfMake.fonts = {
//   Amiri: {
//     normal: amiriFont, // Arabic font
//     bold: amiriFont,
//     italics: amiriFont,
//     bolditalics: amiriFont,
//   },
//   // You can add more fonts here
// };

const Officers = () => {
  const auth = getAuthUser();
  const [officers, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(10); // Number of records per page
  const [showConfirm, setShowConfirm] = useState(false);  // Modal state
  const [selectedOfficer, setSelectedOfficer] = useState(null);  // Selected officer for deletion

  const [endDate, setEndDate] = useState('');
  const [transferID, setTransferID] = useState('');
  const [transferredTo, setTransferredTo] = useState('');

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    // 🔁 Initial fetch
    const fetchData = () => {
      axios
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officer/`, {
          headers: { token: auth.token },
        })
        .then((resp) => {
          setOfficers({
            ...officers,
            results: resp.data,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setOfficers({
            ...officers,
            loading: false,
            err:
              err.response
                ? JSON.stringify(err.response.data.errors)
                : "Something went wrong while fetching data.",
          });
        });
    };

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("officersUpdated", () => {
      console.log("📢 Officers updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, []);


  // Show confirmation modal before deleting
  const handleDeleteClick = (officer) => {
    setSelectedOfficer(officer);
    setShowConfirm(true);
  };

  // Handle form data changes
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleTransferIDChange = (e) => setTransferID(e.target.value);
  const handleTransferredToChange = (e) => setTransferredTo(e.target.value);

  // Confirm deletion
  const confirmDelete = () => {
    if (!selectedOfficer) return;

    // Prepare data to be sent for archiving the officer
    const data = {
      end_date: endDate,
      transferID: transferID,
      transferred_to: transferredTo,
    };

    // Change the API method to DELETE as per the new backend implementation
    axios
      .delete(`${process.env.REACT_APP_BACKEND_BASE_URL}/officer/` + selectedOfficer.mil_id, {
        headers: { token: auth.token },
        data: data,  // Send additional fields in the body of the DELETE request
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedOfficer(null);
        setEndDate('');
        setTransferID('');
        setTransferredTo('');
        setOfficers({ ...officers, reload: officers.reload + 1, success: 'تم حذف الضابط  بنجاح ✅',
          err: null, });
      })
      .catch((err) => {
        setOfficers({
          ...officers,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong. Please try again later.",
        });
        setShowConfirm(false);
      });
  };

  // Get current records for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = officers.results.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(officers.results.length / recordsPerPage);

  // Generate an array of page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Export to PDF using pdfmake
  // const exportToPDF = () => {
  //   const documentDefinition = {
  //     content: [
  //       {
  //         text: 'إدارة الضباط',
  //         style: 'header',
  //         alignment: 'center',
  //         font: 'Amiri'
  //       },
  //       {
  //         text: `تم طباعة هذا المستند في: ${getFormattedDate()}`,
  //         style: 'subheader',
  //         alignment: 'center',
          
  //       },
  //       {
  //         table: {
  //           widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
  //           body: [
  //             [
  //               { text: 'الرقم العسكري', style: 'tableHeader' },
  //               { text: 'الرتبة', style: 'tableHeader' },
  //               { text: 'الإسم', style: 'tableHeader' },
  //               { text: 'الورشة / الفرع', style: 'tableHeader' },
  //               { text: 'تاريخ الضم', style: 'tableHeader' },
  //               { text: 'التمام', style: 'tableHeader' },
  //             ],
  //             ...currentRecords.map((officer) => [
  //               officer.mil_id,
  //               officer.rank,
  //               officer.name,
  //               officer.department,
  //               moment(officer.join_date).format('YYYY-MM-DD'),
  //               officer.in_unit ? 'متواجد' : 'غير موجود',
  //             ]),
  //           ],
  //         },
  //         layout: 'lightHorizontalLines',
  //       },
  //       {
  //         text: `تم طباعة هذا المستند في: ${getFormattedDate()}`,
  //         style: 'footer',
  //         alignment: 'center',
  //       },
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 18,
  //         bold: true,
  //       },
  //       subheader: {
  //         fontSize: 12,
  //         italics: true,
  //       },
  //       footer: {
  //         fontSize: 10,
  //         color: '#888',
  //       },
  //       tableHeader: {
  //         bold: true,
  //         fontSize: 12,
  //         alignment: 'center',
  //         fillColor: '#f2f2f2',
  //       },
  //     },
  //   };

  //   // Generate and open the PDF
  //   pdfMake.createPdf(documentDefinition).open();
  // };
// Function to get current date and time in Arabic format
const getFormattedDate = () => {
  const date = new Date();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return date.toLocaleString('ar-EG', options); // Arabic (Egypt) locale for Arabic format
};

// Export to Word
const exportToWord = () => {
  const table = document.getElementById('officer-table');
  if (table) {
    // Clone the table to modify it before export
    const tableClone = table.cloneNode(true);

    // Remove the "Actions" column (last column)
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th'); // Include both headers and data cells
      if (cells.length > 0) {
        row.deleteCell(cells.length - 1); // Remove the last cell (Actions column)
      }
    });

    // Get current date in Arabic format
    const currentDate = getFormattedDate();

    // Create header and footer content
    const header = `
      <div style="text-align: center; font-size: 16pt; font-weight: bold; font-family: 'Arial', sans-serif;">
        <p>إدارة الضباط</p>
      </div>
    `;
    const footer = `
      <div style="text-align: center; font-size: 10pt; font-family: 'Arial', sans-serif; color: #888;">
        <p>تم طباعة هذا المستند في: ${currentDate}</p>
      </div>
    `;

    // Set the direction to RTL for the Word document and include header, footer, and the table
    const tableHTML = `
      <div style="direction: rtl; font-family: 'Arial', sans-serif; font-size: 12pt;">
        <!-- Header -->
        ${header}
        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid black; padding: 5px;">الرقم العسكري</th>
              <th style="border: 1px solid black; padding: 5px;">الرتبة</th>
              <th style="border: 1px solid black; padding: 5px;">الإسم</th>
              <th style="border: 1px solid black; padding: 5px;">الورشة / الفرع</th>
              <th style="border: 1px solid black; padding: 5px;">تاريخ الضم</th>
              <th style="border: 1px solid black; padding: 5px;">التمام</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from(rows)
              .map((row, index) => {
                const cells = row.querySelectorAll('td');
                const rowStyle = index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f9f9f9;';
                return `
                  <tr style="${rowStyle}">
                    ${Array.from(cells)
                      .map(cell => `<td style="border: 1px solid black; padding: 5px;">${cell.innerHTML}</td>`)
                      .join('')}
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
        <!-- Footer -->
        ${footer}
      </div>
    `;

    // Convert HTML to Word format
    const converted = htmlDocx.asBlob(tableHTML);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = 'officers_table.docx';
    link.click();
  } else {
    alert('Table not found!');
  }
};
  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
  <h3 className="text-center mb-3">إدارة الضباط</h3>

  {/* Button container with d-flex */}
  <div className="d-flex">
    {/* Add New Officer Button */}
    <Link to={"../add"} className="btn btn-success mb-4 mx-2">
      إنشاء ضابط جديد +
    </Link>

    {/* Export Button with Dropdown */}
          <Dropdown className="mb-4">
            <DropdownButton
              variant="secondary"
              id="export-dropdown"
              title={<><FaPrint className="mr-2 " />  طباعة </>}
            >
              {/* Use PDFDownloadLink for PDF export */}
                {/* <Dropdown.Item onClick={exportToPDF}>PDF</Dropdown.Item> */}
              <Dropdown.Item onClick={exportToWord}>Word</Dropdown.Item>
            </DropdownButton>
          </Dropdown>
        </div>
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

      <div className="table-responsive">
        <Table id="officer-table" striped bordered hover>
          <thead>
            <tr>
              <th>م</th> {/* Arabic numbering column */}
              <th>الرقم العسكري</th>
              <th>الرتبة</th>
              <th>الاسم</th>
              <th>الورشة / الفرع</th>
              <th>تاريخ الضم</th>
              <th>ملحق؟</th>
              <th>التمام</th>
              <th className="action-col" >Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((officer, index) => (
              <tr key={officer.mil_id }>
              <td>{index + 1}</td> {/* Arabic numbering, starting from 1 */}
                <td>{officer.mil_id}</td>
                <td>{officer.rank}</td>
                <td>{officer.name}</td>
                <td>{officer.department}</td>
                <td>{moment(officer.join_date).format('YYYY-MM-DD')}</td>
                <td>{officer.attached ? 'نعم' : 'لا'}</td>
                <td>{officer.in_unit ? 'متواجد' : 'غير موجود'}</td>
                <td className="action-col">
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(officer)}
                    >
                      حذف
                    </button>
                    <Link to={`../${officer.id}`} className="btn btn-sm btn-primary">
                      تعديل
                    </Link>
                    <Link to={`../details/${officer.id}`} className="btn btn-sm btn-primary">
                      تفاصيل
                    </Link>
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

        {/* Page Numbers */}
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

      {/* Confirmation Modal for Deleting Officer */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>هل أنت متأكد أنك تريد حذف الضابط <strong>{selectedOfficer?.name}</strong>؟</p>

            {/* Additional Fields */}
            <Form>
              <Form.Group controlId="endDate">
                <Form.Label>تاريخ النقل</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </Form.Group>

              <Form.Group controlId="transferID">
                <Form.Label>رقم بند أوامر النقل</Form.Label>
                <Form.Control
                  type="text"
                  value={transferID}
                  onChange={handleTransferIDChange}
                />
              </Form.Group>

              <Form.Group controlId="transferredTo">
                <Form.Label>تم النقل إلى</Form.Label>
                <Form.Control
                  type="text"
                  value={transferredTo}
                  onChange={handleTransferredToChange}
                />
              </Form.Group>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            حذف
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Officers;
