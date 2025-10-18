import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';

function CustomCard(props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2">
          {props.title}
        </Typography>
        <Typography variant="h4">{props.value}</Typography>
      </CardContent>
    </Card>
  );
}

export default CustomCard;