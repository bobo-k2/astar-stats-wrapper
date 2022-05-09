const express = require('express');
const axios = require('axios');

const API_URL = 'https://api.subquery.network/sq/AstarStats/astarstats-aggregate-block-data';
const app = express();
const port = process.env.PORT || 3000;

app.get('/blockdata/30days', async (req, res) => {
  const result = await axios.post(API_URL, {
    query: 'query { dailyCounts (last:30, orderBy:ID_ASC) { nodes { id, nativeActiveUsers, evmActiveUsers} } }'
  });
  const data = result.data.data.dailyCounts.nodes;
  res.send(data.map(item => {
    return {
      id: item.id,
      nativeActiveUsersCount: item.nativeActiveUsers.length,
      evmActiveUsersCount: item.evmActiveUsers.length,
    }
  }));
})


app.listen(port, () => {
  console.log(`The server is  listening on port ${port}`)
})