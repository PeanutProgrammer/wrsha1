import React from 'react';
import { Grid } from '@material-ui/core';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto';
import Card from './Card';

// ...



function Dashboard() {
  const bookingsData = [
    { month: 'Jan', bookings: 100 },
    { month: 'Feb', bookings: 80 },
    { month: 'Mar', bookings: 120 },
    { month: 'Apr', bookings: 90 },
    { month: 'May', bookings: 110 },
    { month: 'Jun', bookings: 130 },
    { month: 'Jul', bookings: 150 },
    { month: 'Aug', bookings: 140 },
    { month: 'Sep', bookings: 160 },
    { month: 'Oct', bookings: 180 },
    { month: 'Nov', bookings: 200 },
    { month: 'Dec', bookings: 220 }
  ];

  const cardsData = [
    { title: 'Total Bookings', value: 1200 },
    { title: 'Revenue', value: '$6000' },
    { title: 'Pending Bookings', value: 10 }
  ];

  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Bookings',
        data: bookingsData.map((data) => data.bookings),
        borderColor: '#3f51b5',
        fill: false
      }
    ],
    options: {
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          type: 'category',
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July']
        }
      }
    }

  };
 

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12} md={8} lg={8}>
        <Line data={chartData} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={4}>
        {cardsData.map((cardData, index) => (
          <Card key={index} title={cardData.title} value={cardData.value} />
        ))}
      </Grid>
    </Grid>
  );
}

export default Dashboard;






// import React from 'react';
// import './Dashboard.css';

// const Dashboard = () => {
//   return (
//     <div className="wel"> Welcome back,<span>Eslam </span><hr/> </div>
    
//     ); };


//      export default Dashboard;